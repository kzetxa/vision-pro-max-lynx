import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
// import { fetchWorkouts } from '../lib/api'; // Old API call
import { fetchWorkoutsForHome } from '../lib/api'; // New Supabase API call
// import type { WorkoutWithBlock1Preview } from '../lib/types'; // Old type
import type { SupabaseWorkoutPreview } from '../lib/types'; // New Supabase type
import WorkoutCard from '../components/WorkoutCard';
import styles from './Home.module.scss'; // Import the SCSS module

const PAGE_LIMIT = 10;

const Home: React.FC = () => {
  // const [workouts, setWorkouts] = useState<WorkoutWithBlock1Preview[]>([]); // Old state type
  const [workouts, setWorkouts] = useState<SupabaseWorkoutPreview[]>([]); // New state type
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerElement = useRef<HTMLDivElement | null>(null);

  // Data fetching function (simplified)
  const loadWorkouts = useCallback(async (currentPage: number) => {
    console.log(`Attempting to load workouts for page ${currentPage}`);
    // Note: Error state is reset in the calling effect
    try {
      const { workouts: newWorkouts, hasMore: newHasMore } = await fetchWorkoutsForHome(currentPage, PAGE_LIMIT);
      // Use functional update to avoid stale state issues if loads happen very quickly
      setWorkouts(prevWorkouts => currentPage === 1 ? newWorkouts : [...prevWorkouts, ...newWorkouts]);
      setHasMore(newHasMore);
      if (!newHasMore) {
          console.log('No more workouts indicated by API.');
      }
    } catch (err) {
      console.error("Error fetching workouts:", err);
      setError(err instanceof Error ? err.message : 'Failed to load workouts');
      setHasMore(false); // Stop trying to load more if there's an error
    }
  }, []); // No dependencies needed here anymore

  // Effect for managing the Intersection Observer lifecycle
  useEffect(() => {
    const node = loadMoreTriggerElement.current;
    
    // Conditions under which we should NOT observe
    if (loadingInitial || loadingMore || !hasMore || !node) {
      if (observer.current) {
        observer.current.disconnect();
        // console.log('Observer disconnected (loading or no more data or no node).');
      }
      return; // Stop the effect here
    }

    // Ensure previous observer is disconnected before creating a new one
    if (observer.current) {
        observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log('Observer triggered page increment.');
          // Only responsible for incrementing page
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 } // Optional: trigger slightly before fully visible
    );

    // console.log('Observer observing node.');
    observer.current.observe(node);

    // Cleanup function
    return () => {
      if (observer.current) {
        observer.current.disconnect();
        // console.log('Observer disconnected (cleanup).');
      }
    };
  }, [hasMore, loadingInitial, loadingMore]); // Re-run when loading state or hasMore changes

  // Effect for triggering data load when page changes
  useEffect(() => {
    const isInitialPage = page === 1;

    // Set appropriate loading state
    setError(null); // Reset error on new page load attempt
    if (isInitialPage) {
      setLoadingInitial(true);
    } else {
      setLoadingMore(true);
    }

    // Perform the load, then turn off loading indicator
    loadWorkouts(page).finally(() => {
      if (isInitialPage) {
          setLoadingInitial(false);
      } else {
          setLoadingMore(false);
      }
    });
  }, [page, loadWorkouts]); // Triggered only by page changes (and initial mount)

  return (
    <div className={styles.homeContainer}>
      <h1 className={styles.title}>Available Workouts</h1>
      
      {/* Initial Loading Indicator */} 
      {loadingInitial && <p className={styles.statusMessage}>Loading workouts...</p>}
      
      {/* Error Display */} 
      {error && <p className={styles.errorStatus}>Error: {error}</p>}
      
      {/* No Workouts Message */} 
      {!loadingInitial && workouts.length === 0 && !error && (
        <p className={styles.statusMessage}>No workouts found.</p>
      )}

      {/* Workout Grid */} 
      {workouts.length > 0 && (
        <div className={styles.workoutGrid}>
          {workouts.map(workout => (
            <WorkoutCard key={workout.id} workoutPreview={workout} />
          ))}
        </div>
      )}

      {/* Load More Trigger / Indicator Area */} 
      <div ref={loadMoreTriggerElement} className={styles.loadMoreTrigger}>
        {/* Loading More Indicator */} 
        {loadingMore && <p>Loading more...</p>}
        
        {/* End of List Message */} 
        {!loadingInitial && !loadingMore && !hasMore && workouts.length > 0 && 
          <p>No more workouts to load.</p>}
      </div>
    </div>
  );
};

export default Home;
