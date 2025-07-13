<?php


// Exit if accessed directly
if ( !defined( 'ABSPATH' ) ) exit;

// BEGIN ENQUEUE PARENT ACTION
// AUTO GENERATED - Do not modify or remove comment markers above or below:

if ( !function_exists( 'chld_thm_cfg_locale_css' ) ):
    function chld_thm_cfg_locale_css( $uri ){
        if ( empty( $uri ) && is_rtl() && file_exists( get_template_directory() . '/rtl.css' ) )
            $uri = get_template_directory_uri() . '/rtl.css';
        return $uri;
    }
endif;
add_filter( 'locale_stylesheet_uri', 'chld_thm_cfg_locale_css' );

// END ENQUEUE PARENT ACTION

/* ПОДКЛЮЧАЮ СВОИ СКРИПТЫ К ДОЧЕРНЕЙ ТЕМЕ ЧЕРЕЗ ФУНКЦИЮ */
function construction_company_scripts()  // Имя своей функции
{	
	if( is_page( 29346 ) || is_page(29628) || is_page(30848) || is_page(30908) || is_page(31533) || is_page(32227) || is_page(32985)|| is_page(34719) || is_page(34948) || is_page(37258)  ){
		wp_enqueue_style('infinite-style-core',  get_stylesheet_directory_uri() . '/style/one-arm-handstand.css', array(), '1.0.0');

		wp_enqueue_script('script-marquee', 'https://cdn.jsdelivr.net/npm/node-marquee@3.0.6/build/cdn/index.min.js', array(), '1.0.0', true);
		wp_enqueue_script('script-vevet', 'https://cdn.jsdelivr.net/npm/vevet@2.17.0/build/cdn/index.min.js', array(), '1.0.0', true);
		wp_enqueue_script('script-swiper', 'https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js', array(), '1.0.0', true);

		wp_enqueue_script('script-main', get_stylesheet_directory_uri() . '/script/script.js', array(), '1.0.0', true);
		wp_enqueue_script('script-video', get_stylesheet_directory_uri() . '/script/video.js', array(), '1.0.0', true);
	}
}
add_action('wp_enqueue_scripts', 'construction_company_scripts', 11);  // Запускаем функцию
function enqueue_custom_scripts() {
    wp_enqueue_script('your-script-handle', get_template_directory_uri() . '/js/your-script.js', ['jquery'], null, true);

    wp_localize_script('your-script-handle', 'vision_ajax_obj', [
        'ajaxurl' => admin_url('admin-ajax.php'),
        'vision_ajax_nonce' => wp_create_nonce('vision_ajax_nonce'),
    ]);
}
add_action('wp_enqueue_scripts', 'enqueue_custom_scripts');
function crunchify_remove_plugin_stylesheet() {
	if( is_page( 29346 ) || is_page(29628) || is_page(30848) || is_page(30908) || is_page(31533) || is_page(32227) || is_page(32985) || is_page(34719) || is_page(34948) || is_page(37258) ){
		wp_dequeue_style( 'infinite-custom-style' );
		wp_deregister_style( 'infinite-custom-style' );
	}
}
add_action( 'wp_enqueue_scripts', 'crunchify_remove_plugin_stylesheet', 100 );

add_action('wp_enqueue_scripts', 'remove_theme_assets_on_blank_page', 9999);

add_action('wp_enqueue_scripts', function () {
    if (is_page(72720)) {
        wp_dequeue_style('elementor-frontend');
        wp_deregister_style('elementor-frontend');
    }
}, 9999);

function remove_theme_assets_on_blank_page() {
    if (is_page(72720)) {
        wp_dequeue_style('infinite-style-core');
        wp_dequeue_style('infinite-custom-style');
        wp_dequeue_style('infinite-child-theme-style');
		wp_dequeue_style('elementor-frontend');
        wp_dequeue_style('elementor-post-72720'); // ID-specific style
        wp_dequeue_style('elementor-icons');
        wp_dequeue_style('eicons');
        wp_dequeue_style('elementor-global');
        wp_dequeue_style('elementor-common');
        wp_dequeue_style('elementor-pro'); // If you use Pro

        // Optional: also remove block-related styles
        wp_dequeue_style('wp-block-library');
        wp_dequeue_style('classic-theme-styles');
        wp_dequeue_style('global-styles');
    }
}

// ✅ Move this OUT of enqueue_my_styles
add_action('wp_footer', function () {
    if (is_page(72720)) {
        global $wp_styles;

        echo "<script>console.log('%c🎯 Enqueued Styles:', 'color: #3c763d; font-weight: bold;');</script>";

        foreach ($wp_styles->queue as $handle) {
            $style = $wp_styles->registered[$handle];
            $src = esc_js(basename($style->src)); // just the file name
            $handle_escaped = esc_js($handle);

            echo "<script>console.log('{$handle_escaped} → {$src}');</script>";
        }
    }
});
function display_current_page_directory() {
    // Get current page URL
    $current_url = get_permalink();

    // Get the path from the URL
    $parsed_url = parse_url($current_url, PHP_URL_PATH);
	$wpcontent_dir = WP_CONTENT_DIR;
    // Output the directory in a div
    echo '<div id="current-page-directory">' . esc_html($wpcontent_dir) . '</div>';
}

// Add a shortcode for use in Elementor or content editor
add_shortcode('current_directory', 'display_current_page_directory');

function display_html_file_from_id() {
    // Check if the 'id' parameter exists in the URL
    if ( isset( $_GET['id'] ) && !empty( $_GET['id'] ) ) {
        // Sanitize the 'id' parameter to prevent malicious input
        $id = sanitize_text_field( $_GET['id'] );

        // Construct the full file path within wp-content
        $file_path = WP_CONTENT_DIR . '/' . $id . '.html';

        // Check if the file exists
        if ( file_exists( $file_path ) ) {
            // Get the contents of the HTML file
            $html_content = file_get_contents( $file_path );

            // Return the contents to display in the page
            return $html_content;
        } else {
            // Return a message if the file doesn't exist
            return '<p>File not found.</p>';
        }
    } else {
        // Return a message if no 'id' parameter is provided
        return '<p>No file ID provided in the URL.</p>';
    }
}

// Register the shortcode
add_shortcode( 'get_html_by_id', 'display_html_file_from_id' );

function display_html_file_from_id_otherdir() {
    // Check if the 'id' parameter exists in the URL
    if ( isset( $_GET['id'] ) && !empty( $_GET['id'] ) ) {
        // Sanitize the 'id' parameter to prevent malicious input
        $id = sanitize_text_field( $_GET['id'] );

        // Construct the full file path within wp-content
        $file_path = WP_CONTENT_DIR . '/Workouts/' . $id . '.html';

        // Check if the file exists
        if ( file_exists( $file_path ) ) {
            // Get the contents of the HTML file
            $html_content = file_get_contents( $file_path );

            // Return the contents to display in the page
            return $html_content;
        } else {
            // Return a message if the file doesn't exist
            return '<p>File not found.</p>';
        }
    } else {
        // Return a message if no 'id' parameter is provided
        return '<p>No file ID provided in the URL.</p>';
    }
}

// Register the shortcode
add_shortcode( 'get_html_by_id_otherdir', 'display_html_file_from_id_otherdir' );

function display_txt_file_from_id() {
    // Check if the 'id' parameter exists in the URL
    if ( isset( $_GET['id'] ) && !empty( $_GET['id'] ) ) {
        // Sanitize the 'id' parameter
        $id = sanitize_text_field( $_GET['id'] );

        // Construct the file path for .txt file in the wp-content directory
        $file_path = WP_CONTENT_DIR . '/' . $id . '.txt';

        // Check if the file exists
        if ( file_exists( $file_path ) ) {
            // Get the contents of the text file
            $txt_content = file_get_contents( $file_path );

            // Return the contents to display in the page
            return nl2br( esc_html( $txt_content ) );
        } else {
            // Return a message if the file doesn't exist
            return '<p>Text file not found.</p>';
        }
    } else {
        // Return a message if no 'id' parameter is provided
        return '<p>No file ID provided in the URL.</p>';
    }
}

// Register the shortcode
add_shortcode( 'get_txt_by_id', 'display_txt_file_from_id' );





function custom_login_redirect($redirect_to, $request, $user) {
    // --- Start Debugging Logs ---
    error_log("--- custom_login_redirect HOOK CALLED ---");
    error_log("Initial \$redirect_to value received: " . $redirect_to);

    if (is_wp_error($user)) {
        error_log("User object is WP_Error. Message: " . $user->get_error_message());
        error_log("Returning \$redirect_to due to WP_Error: " . $redirect_to);
        return $redirect_to;
    }

    if (isset($user->ID) && $user->ID > 0) {
        error_log("User is valid. User ID: " . $user->ID);
        $user_roles = isset($user->roles) && is_array($user->roles) ? $user->roles : array();
        error_log("User Roles: " . implode(', ', $user_roles));

        if (!empty($user_roles)) {
            if (in_array('administrator', $user_roles)) {
                $admin_redirect_url = admin_url();
                error_log("User is ADMINISTRATOR. Intending to redirect to: " . $admin_redirect_url);
                return $admin_redirect_url;
            } else {
                error_log("User is NOT ADMINISTRATOR. Intending to return original \$redirect_to: " . $redirect_to);
                return $redirect_to; // This should be the original page with parameters
            }
        } else {
            error_log("User has no roles. Intending to return original \$redirect_to: " . $redirect_to);
            return $redirect_to;
        }
    } else {
        error_log("User object not valid or login failed before this hook. Intending to return original \$redirect_to: " . $redirect_to);
        return $redirect_to;
    }
}
add_filter('login_redirect', 'custom_login_redirect', 10, 3);

add_action('wp_footer', 'inject_return_url_map_script');
function inject_return_url_map_script() {
    ?>
    <script>
      window.returnURLMap = {
        labs: "https://courses.coachbachmann.com/one-arm-labs-stage-overview",
        exlib: "https://courses.coachbachmann.com/exercise-library"
      };
    </script>
    <?php
}

// Helper function to get MemberMouse data
function vision_get_global_member_data() {
    if (!is_user_logged_in() || !function_exists('mm_member_data')) {
        return null;
    }
    $member_info = [
        'isLoggedIn'            => true,
        'member_id'             => mm_member_data(['name' => 'id']),
        'first_name'            => mm_member_data(['name' => 'firstName']),
        'membership_level_name' => mm_member_data(['name' => 'membershipName']),
        'bundles'               => []
    ];
    for ($i = 1; $i <= 302; $i++) {
        if (mm_member_decision(['hasBundle' => strval($i)])) {
            $member_info['bundles'][] = strval($i);
        }
    }
    return $member_info;
}

// Main function that makes ALL data available to JavaScript
function vision_make_data_globally_available() {
    $global_data = vision_get_global_member_data();
    if ( is_null($global_data) ) {
        $global_data = ['isLoggedIn' => false];
    }
    $global_data['ajax_url'] = admin_url('admin-ajax.php');
    $global_data['nonce']    = wp_create_nonce('vision_ajax_nonce');
    
    wp_localize_script('jquery', 'visionGlobalMember', $global_data);
}
add_action('wp_enqueue_scripts', 'vision_make_data_globally_available', 99);


// ===================================================================
// ALL AJAX HANDLERS
// ===================================================================

/**
 * AJAX Handler for the 'Programs' page.
 */
function get_airtable_programs_ajax_handler() {
    check_ajax_referer('vision_ajax_nonce', 'security');
    
    $upload_dir = wp_upload_dir();
    $cache_dir = $upload_dir['basedir'] . '/app-cache';
    if (!is_dir($cache_dir)) { wp_mkdir_p($cache_dir); }
    $cache_file = $cache_dir . '/airtable_programs.json';
    $cache_life = 15 * 60; 

    if (file_exists($cache_file) && (time() - filemtime($cache_file)) < $cache_life) {
        $airtable_data = json_decode(file_get_contents($cache_file), true);
        $airtable_data['debug_source'] = 'SUCCESS: Raw data from file cache';
    } else {
        $api_key = getenv('AIRTABLE_API_KEY');
        $base_id = getenv('AIRTABLE_BASE_ID');
        $table_id = 'tblpydFC2A0pGSSig';
        
        $fields_to_fetch = [
            'ID', 'img', 'mobileImg', 'description', 'level', 'duration', 
            'discipline', 'Type', 'price', 'Additional Tags', 'Bundles for access IDs',
            'linkSales', 'Start program link', 'Demo Video Desktop', 'Demo Video Mobile',
            'newURL', 'Customization Check', 'Customization URL'
        ];
        
        $airtable_url = "https://api.airtable.com/v0/{$base_id}/{$table_id}";
        $query_params = [];
        foreach ($fields_to_fetch as $field) { $query_params[] = 'fields[]=' . urlencode($field); }
        $airtable_url .= '?' . implode('&', $query_params);
        
        $response = wp_remote_get($airtable_url, ['headers' => ['Authorization' => 'Bearer ' . $api_key]]);

        if (is_wp_error($response) || wp_remote_retrieve_response_code($response) != 200) {
            wp_send_json_error(['message' => 'Failed to fetch program list from Airtable.']);
            return;
        }

        $airtable_data = json_decode(wp_remote_retrieve_body($response), true);
        file_put_contents($cache_file, json_encode($airtable_data));
        $airtable_data['debug_source'] = 'FRESH PULL FROM AIRTABLE API';
    }

    $user_id = get_current_user_id();
    $user_bundles_set = [];
    if ($user_id > 0 && function_exists('mm_member_decision')) {
        $user_bundles = [];
        for ($i = 1; $i <= 302; $i++) {
            if (mm_member_decision(['hasBundle' => strval($i)])) {
                $user_bundles[] = strval($i);
            }
        }
        $user_bundles_set = array_flip($user_bundles);
    }
    
    if (isset($airtable_data['records'])) {
        foreach ($airtable_data['records'] as &$record) {
            $fields = $record['fields'];
            $required_bundles_raw = $fields['Bundles for access IDs'] ?? [];
            $required_bundles = is_array($required_bundles_raw) ? $required_bundles_raw : array_map('trim', explode(',', $required_bundles_raw));
            
            $is_free = strtolower($fields['price'] ?? '') === 'free' || empty($required_bundles);
            $has_bundle_access = false;
            if (!empty($required_bundles)) {
                foreach ($required_bundles as $req_bundle) {
                    if (isset($user_bundles_set[$req_bundle])) {
                        $has_bundle_access = true;
                        break;
                    }
                }
            }
            $record['isLocked'] = !($is_free || $has_bundle_access);
        }
        unset($record);
    }

    wp_send_json_success($airtable_data);
}

/**
 * AJAX handler for fetching Wizard Questions.
 */
function vision_get_wizard_questions_handler() {
    check_ajax_referer('vision_ajax_nonce', 'security');
    if (!isset($_POST['question_ids']) || empty($_POST['question_ids'])) {
        wp_send_json_error(['message' => 'Error: No question IDs were provided.']);
        return;
    }
    $question_ids = array_map('sanitize_text_field', explode(',', $_POST['question_ids']));
    $formula_parts = array_map(function($id) { return '{Question ID}="' . $id . '"'; }, $question_ids);
    $formula = 'OR(' . implode(',', $formula_parts) . ')';
    $api_key  = getenv('AIRTABLE_API_KEY');
    $base_id  = getenv('WIZARD_QUESTIONS_BASE_ID');
    $table_id = getenv('WIZARD_QUESTIONS_TABLE_ID');
    if (empty($api_key) || empty($base_id) || empty($table_id)) {
        wp_send_json_error(['message' => 'Server Error: Airtable API is not configured.']);
        return;
    }
    $airtable_url = "https://api.airtable.com/v0/{$base_id}/{$table_id}?filterByFormula=" . urlencode($formula);
    $response = wp_remote_get($airtable_url, ['headers' => ['Authorization' => 'Bearer ' . $api_key]]);
    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        wp_send_json_error(['message' => 'Error: Could not retrieve questions from the server.']);
        return;
    }
    wp_send_json_success(json_decode(wp_remote_retrieve_body($response), true));
}

/**
 * AJAX handler for saving Wizard Answers.
 */
function vision_save_wizard_answers_handler() {
    check_ajax_referer('vision_ajax_nonce', 'security');
    if (!is_user_logged_in()) {
        wp_send_json_error(['message' => 'Access Denied: You must be logged in to save answers.']);
        return;
    }
    if (!isset($_POST['answers']) || empty($_POST['answers'])) {
        wp_send_json_error(['message' => 'Invalid data format: No answers provided.']);
        return;
    }
    $answers = json_decode(stripslashes($_POST['answers']), true);
    if (!is_array($answers) || json_last_error() !== JSON_ERROR_NONE) {
        wp_send_json_error(['message' => 'Invalid data format: Answers could not be processed.']);
        return;
    }
    $records_to_create = [];
    foreach ($answers as $answer) {
        $records_to_create[] = ['fields' => [
            'clientid' => sanitize_text_field($answer['clientid']),
            'levelid'  => sanitize_text_field($answer['levelid']),
            'level'    => sanitize_text_field($answer['level']),
        ]];
    }
    if (empty($records_to_create)) {
        wp_send_json_success(['message' => 'No answers to save.']);
        return;
    }
    $api_key  = getenv('AIRTABLE_API_KEY');
    $base_id  = getenv('AIRTABLE_PROFILE_BASE_ID');
    $table_id = getenv('WIZARD_ANSWERS_TABLE_ID');
    if (empty($api_key) || empty($base_id) || empty($table_id)) {
        wp_send_json_error(['message' => 'Server Error: Airtable API is not configured.']);
        return;
    }
    $airtable_url = "https://api.airtable.com/v0/{$base_id}/{$table_id}";
    $post_body = json_encode(['records' => $records_to_create]);
    $response = wp_remote_post($airtable_url, ['headers' => ['Authorization' => 'Bearer ' . $api_key, 'Content-Type'  => 'application/json'], 'body' => $post_body]);
    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        wp_send_json_error(['message' => 'Error: Could not save answers to the server.']);
        return;
    }
    wp_send_json_success(['message' => 'Answers saved successfully.']);
}

// HOOKS FOR ALL AJAX HANDLERS
add_action('wp_ajax_get_airtable_programs', 'get_airtable_programs_ajax_handler');
add_action('wp_ajax_nopriv_get_airtable_programs', 'get_airtable_programs_ajax_handler');
add_action('wp_ajax_get_wizard_questions', 'vision_get_wizard_questions_handler');
add_action('wp_ajax_nopriv_get_wizard_questions', 'vision_get_wizard_questions_handler');
add_action('wp_ajax_save_wizard_answers', 'vision_save_wizard_answers_handler');



// ===================================================================
// AJAX HANDLERS FOR VISION WORKOUT PAGE
// ===================================================================

/**
 * AJAX handler for fetching a single workout's data from Airtable.
 * This acts as a secure proxy to protect the API key.
 */
function vision_get_workout_data_handler() {
    // Nonce check for security
    check_ajax_referer('vision_ajax_nonce', 'security');

    if (!isset($_POST['vimeo_id']) || empty($_POST['vimeo_id'])) {
        wp_send_json_error(['message' => 'Error: No Vimeo ID was provided.']);
        return;
    }

    $vimeo_id = sanitize_text_field($_POST['vimeo_id']);

    // Get credentials from environment variables
    $api_key  = getenv('AIRTABLE_API_KEY');
    $base_id  = getenv('WORKOUT_DATA_BASE_ID');
    $table_id = 'Follow%20Along%20Workouts'; // URL Encoded table name

    if (empty($api_key) || empty($base_id)) {
        wp_send_json_error(['message' => 'Server Error: Airtable API is not configured.']);
        return;
    }

    $formula = '{vimeo}="' . $vimeo_id . '"';
    $airtable_url = "https://api.airtable.com/v0/{$base_id}/{$table_id}?filterByFormula=" . urlencode($formula);

    $response = wp_remote_get($airtable_url, ['headers' => ['Authorization' => 'Bearer ' . $api_key]]);

    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        wp_send_json_error(['message' => 'Error: Could not retrieve workout data from the server.']);
        return;
    }

    // Forward the successful response from Airtable to the client
    wp_send_json_success(json_decode(wp_remote_retrieve_body($response), true));
}

/**
 * AJAX handler for checking if the current user has "liked" a workout.
 */
function vision_get_workout_like_status_handler() {
    check_ajax_referer('vision_ajax_nonce', 'security');

    if (!is_user_logged_in()) {
        wp_send_json_error(['message' => 'Access Denied: User not logged in.']);
        return;
    }
    if (!isset($_POST['workout_id']) || empty($_POST['workout_id'])) {
        wp_send_json_error(['message' => 'Error: No workout ID provided.']);
        return;
    }

    $workout_id = sanitize_text_field($_POST['workout_id']);
    $client_id = mm_member_data(['name' => 'id']); // Get MemberMouse member ID

    $api_key  = getenv('AIRTABLE_API_KEY');
    $base_id  = getenv('AIRTABLE_PROFILE_BASE_ID');
    $table_id = 'tblQuWWaiH7uDE185'; // Likes table

    $formula = "AND({clientID} = '{$client_id}', {workoutID} = '{$workout_id}')";
    $airtable_url = "https://api.airtable.com/v0/{$base_id}/{$table_id}?filterByFormula=" . urlencode($formula);

    $response = wp_remote_get($airtable_url, ['headers' => ['Authorization' => 'Bearer ' . $api_key]]);

    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        wp_send_json_error(['message' => 'Error: Could not fetch like status.']);
        return;
    }

    wp_send_json_success(json_decode(wp_remote_retrieve_body($response), true));
}

/**
 * AJAX handler to add or remove a workout "like" record in Airtable.
 */
function vision_toggle_workout_like_handler() {
    check_ajax_referer('vision_ajax_nonce', 'security');

    if (!is_user_logged_in()) {
        wp_send_json_error(['message' => 'Access Denied: User not logged in.']);
        return;
    }
    if (!isset($_POST['workout_id']) || !isset($_POST['is_liked'])) {
        wp_send_json_error(['message' => 'Error: Missing required parameters.']);
        return;
    }

    $workout_id = sanitize_text_field($_POST['workout_id']);
    $is_liked = sanitize_text_field($_POST['is_liked']) === 'true'; // Check if the workout is already liked
    $record_id_to_delete = sanitize_text_field($_POST['record_id']);

    $api_key  = getenv('AIRTABLE_API_KEY');
    $base_id  = getenv('AIRTABLE_PROFILE_BASE_ID');
    $table_id = 'tblQuWWaiH7uDE185';
    $airtable_url = "https://api.airtable.com/v0/{$base_id}/{$table_id}";

    // If it's already liked, we need to UNLIKE it (DELETE record)
    if ($is_liked) {
        if (empty($record_id_to_delete)) {
            wp_send_json_error(['message' => 'Error: Cannot unlike without a record ID.']);
            return;
        }
        $response = wp_remote_request("{$airtable_url}/{$record_id_to_delete}", [
            'method'  => 'DELETE',
            'headers' => ['Authorization' => 'Bearer ' . $api_key]
        ]);
    }
    // If it's not liked, we need to LIKE it (CREATE record)
    else {
        $client_id = mm_member_data(['name' => 'id']);
        $post_body = json_encode([
            'fields' => [
                'clientID'  => $client_id,
                'workoutID' => $workout_id
            ]
        ]);
        $response = wp_remote_post($airtable_url, [
            'headers' => ['Authorization' => 'Bearer ' . $api_key, 'Content-Type' => 'application/json'],
            'body'    => $post_body
        ]);
    }

    if (is_wp_error($response) || !in_array(wp_remote_retrieve_response_code($response), [200, 201])) {
        wp_send_json_error(['message' => 'Server Error: The action could not be completed.']);
        return;
    }

    wp_send_json_success(json_decode(wp_remote_retrieve_body($response), true));
}


// HOOKS FOR NEW AJAX HANDLERS
// Allow logged-in and non-logged-in users to fetch workout data
add_action('wp_ajax_nopriv_get_workout_data', 'vision_get_workout_data_handler');
add_action('wp_ajax_get_workout_data', 'vision_get_workout_data_handler');

// Only allow logged-in users to interact with "likes"
add_action('wp_ajax_get_workout_like_status', 'vision_get_workout_like_status_handler');
add_action('wp_ajax_toggle_workout_like', 'vision_toggle_workout_like_handler');

/*
function safe_load_api_credentials() {
    // This function tells WordPress to prepare our API keys from the server.
    // We're attaching them to 'jquery', a script that is almost always loaded on WordPress pages.

wp_localize_script('jquery', 'airtable_credentials', array(
    // Existing keys
    'api_key'                   => getenv('AIRTABLE_API_KEY'),
    'profile_base_id'           => getenv('AIRTABLE_PROFILE_BASE_ID'),
    'base_id'                   => getenv('AIRTABLE_BASE_ID'),
    'vimeo_token'               => getenv('VIMEO_API_TOKEN'),
    'workout_data_base_id'      => getenv('WORKOUT_DATA_BASE_ID'),

	'technique_school_base_id'  => getenv('AIRTABLE_BASE_ID'), 

  
    'wizard_questions_base_id'  => getenv('WIZARD_QUESTIONS_BASE_ID'),
    'wizard_questions_table_id' => getenv('WIZARD_QUESTIONS_TABLE_ID'),
    'wizard_answers_table_id'   => getenv('WIZARD_ANSWERS_TABLE_ID'),
	 'mm_api_key'                => getenv('MM_API_KEY'),
    'mm_secret_key'             => getenv('MM_SECRET_KEY'),
    'airtable_avatar_table_id'  => getenv('AIRTABLE_AVATAR_TABLE_ID'),
    'knowledgebase_base_id'     => getenv('KNOWLEDGEBASE_BASE_ID')
));
}

// This line tells WordPress to run our function at the right time.
add_action('wp_enqueue_scripts', 'safe_load_api_credentials');  
  
 */
// ===================================================================
// AJAX HANDLERS FOR TECHNIQUE SCHOOL PAGE
// ===================================================================

/**
 * Helper function to fetch all records from an Airtable table, handling pagination.
 *
 * @param string $base_id   The Airtable Base ID.
 * @param string $table_id  The Airtable Table ID.
 * @param array  $options   Optional parameters like 'filterByFormula'.
 * @return array|WP_Error   An array of records or a WP_Error on failure.
 */
function vision_airtable_paginated_request( $base_id, $table_id, $options = [] ) {
    $api_key = getenv('AIRTABLE_API_KEY');
    if ( empty( $api_key ) || empty( $base_id ) || empty( $table_id ) ) {
        return new WP_Error('api_config_error', 'Airtable API is not configured on the server.');
    }

    $all_records = [];
    $offset = null;
    $url = "https://api.airtable.com/v0/{$base_id}/{$table_id}";

    // Add query parameters from options
    $query_params = [];
    if ( ! empty( $options['filterByFormula'] ) ) {
        $query_params['filterByFormula'] = $options['filterByFormula'];
    }
    if ( ! empty( $options['fields'] ) ) {
        $query_params['fields'] = $options['fields'];
    }

    do {
        $request_url = add_query_arg($query_params, $url);
        if ($offset) {
            $request_url = add_query_arg('offset', $offset, $request_url);
        }

        $response = wp_remote_get($request_url, [
            'headers' => ['Authorization' => 'Bearer ' . $api_key]
        ]);

        if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
            return new WP_Error('api_fetch_error', 'Failed to fetch data from Airtable.');
        }

        $body = json_decode(wp_remote_retrieve_body($response), true);
        $all_records = array_merge($all_records, $body['records']);
        $offset = $body['offset'] ?? null;

    } while ($offset);

    return $all_records;
}


/**
 * AJAX handler to fetch all necessary data for the Technique School page.
 * This version uses FILE-BASED caching to ensure compatibility with your server.
 */
function vision_get_technique_school_data_ajax_handler() {
    check_ajax_referer('vision_ajax_nonce', 'security');

    // --- Public Data (File Cached) ---
    $upload_dir = wp_upload_dir();
    $cache_dir = $upload_dir['basedir'] . '/app-cache';
    if (!is_dir($cache_dir)) {
        wp_mkdir_p($cache_dir);
    }
    $cache_file = $cache_dir . '/technique_school_public_data.json';
    $cache_life = 1 * HOUR_IN_SECONDS; // Cache for 1 hour

    if (file_exists($cache_file) && (time() - filemtime($cache_file)) < $cache_life) {
        // Data found in cache, use it
        $public_data = json_decode(file_get_contents($cache_file), true);
        $articles = $public_data['articles'];
        $techniques = $public_data['techniques'];
    } else {
        // No cache found, fetch fresh data from Airtable
        $knowledgebase_base_id = getenv('KNOWLEDGEBASE_BASE_ID');
        $articles = vision_airtable_paginated_request($knowledgebase_base_id, 'Knowledgebase', [
            'filterByFormula' => "OR({Status} = 'posted', {Status} = 'redo')"
        ]);

        $technique_school_base_id = getenv('AIRTABLE_BASE_ID');
        $techniques = vision_airtable_paginated_request($technique_school_base_id, 'tblLptaZBvocu1lrb', [
            'filterByFormula' => "NOT({Vimeo ID} = '')",
            'fields' => ["Title", "Tags", "Vimeo ID", "Free", "Bundles"]
        ]);

        // Check for errors before caching
        if (is_wp_error($articles) || is_wp_error($techniques)) {
            wp_send_json_error(['message' => 'There was an error retrieving public data from the source.']);
            return;
        }

        // Store the freshly fetched public data in the cache file
        $public_data_to_cache = ['articles' => $articles, 'techniques' => $techniques];
        file_put_contents($cache_file, json_encode($public_data_to_cache));
    }
    
    // --- User-Specific Data (Not Cached) ---
    $liked_items = [];
    if (is_user_logged_in() && function_exists('mm_member_data')) {
        $client_id = mm_member_data(['name' => 'id']);
        if ($client_id) {
            $profile_base_id = getenv('AIRTABLE_PROFILE_BASE_ID');
            // This is a small, fast query and is always fresh for each user
            $liked_items = vision_airtable_paginated_request($profile_base_id, 'tblQuWWaiH7uDE185', [
                'filterByFormula' => "{clientID}='" . $client_id . "'"
            ]);
        }
    }

    if (is_wp_error($liked_items)) {
        wp_send_json_error(['message' => 'There was an error retrieving user-specific data.']);
        return;
    }

    // --- Send the final combined response ---
    wp_send_json_success([
        'articles' => $articles,
        'techniques' => $techniques,
        'likedItems' => $liked_items,
    ]);
}

/**
 * AJAX handler for fetching Vimeo video metadata.
 * Implements caching using WordPress transients to reduce API calls.
 */
function vision_get_vimeo_metadata_ajax_handler() {
    check_ajax_referer('vision_ajax_nonce', 'security');

    if (!isset($_POST['vimeo_id']) || empty($_POST['vimeo_id'])) {
        wp_send_json_error(['message' => 'No Vimeo ID provided.']);
        return;
    }

    $vimeo_id = sanitize_text_field($_POST['vimeo_id']);
    $transient_key = 'vimeo_meta_' . $vimeo_id;

    // Check for cached data first
    if (false !== ($cached_data = get_transient($transient_key))) {
        wp_send_json_success($cached_data);
        return;
    }

    $vimeo_token = getenv('VIMEO_API_TOKEN');
    if (empty($vimeo_token)) {
        wp_send_json_error(['message' => 'Vimeo API is not configured on the server.']);
        return;
    }

    $url = "https://api.vimeo.com/videos/{$vimeo_id}?fields=duration,pictures.sizes,name";
    $response = wp_remote_get($url, [
        'headers' => [
            'Authorization' => 'bearer ' . $vimeo_token,
            'Content-Type'  => 'application/json',
            'Accept'        => 'application/vnd.vimeo.*+json;version=3.4'
        ]
    ]);

    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        wp_send_json_error(['message' => 'Could not fetch video metadata.']);
        return;
    }

    $metadata = json_decode(wp_remote_retrieve_body($response), true);

    // Cache the successful response for 3 hours
    set_transient($transient_key, $metadata, 3 * HOUR_IN_SECONDS);

    wp_send_json_success($metadata);
}


/**
 * AJAX handler for toggling a "like" on an article or technique.
 */
function vision_toggle_like_ajax_handler() {
    check_ajax_referer('vision_ajax_nonce', 'security');

    if (!is_user_logged_in() || !function_exists('mm_member_data')) {
        wp_send_json_error(['message' => 'You must be logged in to perform this action.']);
        return;
    }
    
    $api_key = getenv('AIRTABLE_API_KEY');
    $base_id = getenv('AIRTABLE_PROFILE_BASE_ID');
    $table_id = 'tblQuWWaiH7uDE185'; // Likes table

    if (empty($api_key) || empty($base_id)) {
        wp_send_json_error(['message' => 'API is not configured on the server.']);
        return;
    }
    
    $item_id = sanitize_text_field($_POST['item_id']);
    $item_type = sanitize_text_field($_POST['item_type']); // 'article' or 'technique'
    $is_liked = filter_var($_POST['is_liked'], FILTER_VALIDATE_BOOLEAN);

    $airtable_url = "https://api.airtable.com/v0/{$base_id}/{$table_id}";
    $headers = ['Authorization' => 'Bearer ' . $api_key, 'Content-Type' => 'application/json'];

    // If the item is already liked, we are UN-liking it (DELETE)
    if ($is_liked) {
        $record_id = sanitize_text_field($_POST['record_id']);
        if (empty($record_id)) {
            wp_send_json_error(['message' => 'Cannot unlike without a record ID.']);
            return;
        }
        $response = wp_remote_request("{$airtable_url}/{$record_id}", [
            'method'  => 'DELETE',
            'headers' => $headers
        ]);
    } 
    // Otherwise, we are LIKING it (CREATE)
    else {
        $client_id = mm_member_data(['name' => 'id']);
        $fields = ['clientID' => $client_id];
        
        // Airtable field names are 'articleID' and 'techniqueID'
        if ($item_type === 'article') {
            $fields['articleID'] = $item_id;
        } else {
            $fields['techniqueID'] = $item_id;
        }

        $response = wp_remote_post($airtable_url, [
            'headers' => $headers,
            'body'    => json_encode(['fields' => $fields])
        ]);
    }

    if (is_wp_error($response) || !in_array(wp_remote_retrieve_response_code($response), [200, 201])) {
        wp_send_json_error(['message' => 'The action could not be completed on the server.']);
        return;
    }
    
    wp_send_json_success(json_decode(wp_remote_retrieve_body($response), true));
}


// HOOKS FOR TECHNIQUE SCHOOL AJAX HANDLERS
add_action('wp_ajax_get_technique_school_data', 'vision_get_technique_school_data_ajax_handler');
add_action('wp_ajax_nopriv_get_technique_school_data', 'vision_get_technique_school_data_ajax_handler');

add_action('wp_ajax_get_vimeo_metadata', 'vision_get_vimeo_metadata_ajax_handler');
add_action('wp_ajax_nopriv_get_vimeo_metadata', 'vision_get_vimeo_metadata_ajax_handler');

add_action('wp_ajax_toggle_like', 'vision_toggle_like_ajax_handler');
/**
 * ===================================================================
 * AJAX HANDLER FOR THE VISION PROGRAM PAGE (FINAL & COMPLETE)
 * ===================================================================
 */
function vision_get_program_page_data_handler() {
    // 1. Security, Validation, and Credentials
    check_ajax_referer('vision_ajax_nonce', 'security');
    if (!isset($_POST['rid']) || empty($_POST['rid'])) { wp_send_json_error(['message' => 'Error: Program identifier (rid) is missing.']); return; }
    $rid = sanitize_text_field($_POST['rid']);
    $client_id = is_user_logged_in() && function_exists('mm_member_data') ? mm_member_data(['name' => 'id']) : null;
    $airtable_api_key = getenv('AIRTABLE_API_KEY');
    $vimeo_api_token = getenv('VIMEO_API_TOKEN');
    $main_base_id = getenv('AIRTABLE_BASE_ID');
    $profile_base_id = getenv('AIRTABLE_PROFILE_BASE_ID');
    
    // 2. Fetch All Public Program Content
    $program_table_id = 'tblpydFC2A0pGSSig';
    $program_filter_formula = "FIND('?rid={$rid}', {Check Out Link})";
    $program_data = vision_airtable_paginated_request($main_base_id, $program_table_id, ['filterByFormula' => $program_filter_formula]);
    if (empty($program_data) || is_wp_error($program_data)) { wp_send_json_error(['message' => 'Program not found or API error.']); return; }
    $program_record = $program_data[0];
    $program_record_fields = $program_record['fields'];
    $stage_ids = $program_record_fields['stage / group'] ?? [];
    if (empty($stage_ids)) {
        $final_data = [ 'programRecord' => $program_record, 'stageData' => ['program' => $program_record_fields, 'allStages' => []], 'clientProfile' => [], 'vimeoMetadata' => [], 'userAccessLevel' => 'visitor' ];
        wp_send_json_success($final_data); return;
    }
    $stage_records_unsorted = vision_airtable_paginated_request($main_base_id, 'tbl96VEnK0mIEiqRg', ['filterByFormula' => 'OR(' . implode(',', array_map(function($id) { return "RECORD_ID()='{$id}'"; }, $stage_ids)) . ')']);
    usort($stage_records_unsorted, function($a, $b) { return ($a['fields']['Sort number'] ?? 999) - ($b['fields']['Sort number'] ?? 999); });
    $stage_records = $stage_records_unsorted;
    $all_intro_video_ids = []; $all_week_section_ids = []; $all_technique_ids = []; $all_knowledge_ids = [];
    foreach ($stage_records as $stage) {
        $all_intro_video_ids = array_merge($all_intro_video_ids, $stage['fields']['Stage Intro Videos'] ?? []);
        $all_week_section_ids = array_merge($all_week_section_ids, $stage['fields']['week / section'] ?? []);
        $all_technique_ids = array_merge($all_technique_ids, $stage['fields']['Technique School'] ?? []);
        $all_knowledge_ids = array_merge($all_knowledge_ids, $stage['fields']['Knowledgebase'] ?? []);
    }
    $intro_video_records_map = []; $week_section_records_map = []; $technique_records_map = []; $knowledge_records_map = []; $workout_records_map = [];
    $intro_video_records = !empty($all_intro_video_ids) ? vision_airtable_paginated_request($main_base_id, 'tblS8mlRX4rhLaLw6', ['filterByFormula' => 'OR(' . implode(',', array_map(function($id) { return "RECORD_ID()='{$id}'"; }, array_unique($all_intro_video_ids))) . ')']) : [];
    foreach ($intro_video_records as $rec) { $intro_video_records_map[$rec['id']] = $rec; }
    $week_section_records = !empty($all_week_section_ids) ? vision_airtable_paginated_request($main_base_id, 'tbluCrUYa81GjRpOo', ['filterByFormula' => 'OR(' . implode(',', array_map(function($id) { return "RECORD_ID()='{$id}'"; }, array_unique($all_week_section_ids))) . ')']) : [];
    foreach ($week_section_records as $rec) { $week_section_records_map[$rec['id']] = $rec; }
    $technique_records = !empty($all_technique_ids) ? vision_airtable_paginated_request($main_base_id, 'tblLptaZBvocu1lrb', ['filterByFormula' => 'OR(' . implode(',', array_map(function($id) { return "RECORD_ID()='{$id}'"; }, array_unique($all_technique_ids))) . ')', 'fields' => ['Title', 'Tags', 'Vimeo ID']]) : [];
    foreach ($technique_records as $rec) { $technique_records_map[$rec['id']] = $rec; }
    $knowledge_records = !empty($all_knowledge_ids) ? vision_airtable_paginated_request($main_base_id, 'tbli2AMKyJCeIX1rU', ['filterByFormula' => 'OR(' . implode(',', array_map(function($id) { return "RECORD_ID()='{$id}'"; }, array_unique($all_knowledge_ids))) . ')']) : [];
    foreach ($knowledge_records as $rec) { $knowledge_records_map[$rec['id']] = $rec; }
    $all_workout_ids = [];
    foreach ($week_section_records as $week) { $all_workout_ids = array_merge($all_workout_ids, $week['fields']['Workouts Api'] ?? []); }
    $workout_records = !empty($all_workout_ids) ? vision_airtable_paginated_request($main_base_id, 'tblV2bMzCRMCNAacQ', ['filterByFormula' => 'OR(' . implode(',', array_map(function($id) { return "RECORD_ID()='{$id}'"; }, array_unique($all_workout_ids))) . ')']) : [];
    foreach ($workout_records as $rec) { $workout_records_map[$rec['id']] = $rec; }
    
    // 3. --- FETCH ALL USER-SPECIFIC DATA (CORRECTED) ---
    $done_workouts = []; $like_map = []; $technique_like_map = []; $customization_map = []; $user_bundles = [];
    $user_access_level = 'visitor';
    if ($client_id) {
        if (function_exists('mm_member_decision')) { for ($i = 1; $i <= 302; $i++) { if (mm_member_decision(['hasBundle' => strval($i)])) { $user_bundles[] = strval($i); } } }
        $required_bundles_raw = $program_record_fields['Bundles for access IDs'] ?? [];
        $required_bundles = is_array($required_bundles_raw) ? $required_bundles_raw : array_map('trim', explode(',', $required_bundles_raw));
        $has_access = empty($required_bundles);
        if (!$has_access) { foreach ($required_bundles as $req_bundle) { if (in_array($req_bundle, $user_bundles)) { $has_access = true; break; } } }
        $user_access_level = $has_access ? 'full access' : 'free user';
        
        $done_workouts_data = vision_airtable_paginated_request($profile_base_id, 'tblBsEWWqDXrXOQPD', ['filterByFormula' => "{clientid}='{$client_id}'", 'fields' => ['workoutid']]);
        if (!is_wp_error($done_workouts_data)) { $done_workouts = array_map(function($r) { return $r['fields']['workoutid'] ?? null; }, $done_workouts_data); }

        $likes_data = vision_airtable_paginated_request($profile_base_id, 'tblQuWWaiH7uDE185', ['filterByFormula' => "{clientID}='{$client_id}'", 'fields' => ['articleID', 'techniqueID']]);
        if (!is_wp_error($likes_data)) {
            foreach ($likes_data as $rec) {
                if (!empty($rec['fields']['articleID'])) { $like_map[is_array($rec['fields']['articleID']) ? $rec['fields']['articleID'][0] : $rec['fields']['articleID']] = $rec['id']; }
                if (!empty($rec['fields']['techniqueID'])) { $technique_like_map[is_array($rec['fields']['techniqueID']) ? $rec['fields']['techniqueID'][0] : $rec['fields']['techniqueID']] = $rec['id']; }
            }
        }

        $all_customization_ids = [];
        foreach ($workout_records as $workout) {
            if (isset($workout['fields']['IDs of all customizations used'])) {
                $ids_raw = $workout['fields']['IDs of all customizations used'];
                $ids_string = is_array($ids_raw) ? implode(',', $ids_raw) : strval($ids_raw);
                $ids_array = array_filter(array_map('trim', explode(',', $ids_string)));
                $all_customization_ids = array_merge($all_customization_ids, $ids_array);
            }
        }
        $unique_customization_ids = array_unique(array_filter($all_customization_ids));
        if (!empty($unique_customization_ids)) {
            $customization_formula_parts = array_map(function($id) { return "{levelid}='{$id}'"; }, $unique_customization_ids);
            $customization_formula = "AND({clientid}='{$client_id}', OR(" . implode(',', $customization_formula_parts) . "))";
            $customization_data = vision_airtable_paginated_request($profile_base_id, 'tblKMLKyuNg5HsuzW', ['filterByFormula' => $customization_formula, 'fields' => ['levelid']]);
            if (!is_wp_error($customization_data) && !empty($customization_data)) {
                foreach ($customization_data as $rec) {
                    if (!empty($rec['fields']['levelid'])) {
                        $level_id = is_array($rec['fields']['levelid']) ? $rec['fields']['levelid'][0] : $rec['fields']['levelid'];
                        $customization_map[trim($level_id)] = true;
                    }
                }
            }
        }
    }
    
    // 4. --- FINAL, CORRECTED DATA ASSEMBLY ---
    $final_all_stages = array_map(function($stage_rec) use ($week_section_records_map, $workout_records_map, $intro_video_records_map, $technique_records_map, $knowledge_records_map, $done_workouts, $program_record_fields) {
        $stage_fields = $stage_rec['fields'];
        $week_ids_for_stage = $stage_fields['week / section'] ?? [];
        $week_sections_for_stage_unsorted = array_intersect_key($week_section_records_map, array_flip($week_ids_for_stage));
        usort($week_sections_for_stage_unsorted, function($a, $b) { return ($a['fields']['Order'] ?? 999) - ($b['fields']['Order'] ?? 999); });

        $final_week_sections = array_map(function($week_rec) use ($workout_records_map, $done_workouts, $program_record_fields) {
            $workout_ids_for_week = $week_rec['fields']['Workouts Api'] ?? [];
            $workouts_for_week_unsorted = array_intersect_key($workout_records_map, array_flip($workout_ids_for_week));
            $done_workouts_trimmed = array_map('trim', $done_workouts);




           // Replace the entire final_workouts block in your PHP function
$final_workouts = array_map(function($workout_rec) use ($done_workouts_trimmed, $program_record_fields) {
    $fields = $workout_rec['fields'] ?? [];

    // FIX: Ensure all fields that might be lookups/arrays are converted to simple strings
    $workout_id = $fields['ID'] ?? null;
    if (is_array($workout_id)) { $workout_id = $workout_id[0] ?? null; }

    $workout_title = $fields['Title'] ?? 'Untitled Workout';
    if (is_array($workout_title)) { $workout_title = $workout_title[0] ?? 'Untitled Workout'; }
    
    $focus_area_raw = $fields['Focus Area'] ?? 'General';
    $focus_area = is_array($focus_area_raw) ? ($focus_area_raw[0] ?? 'General') : $focus_area_raw;
    
    $raw_block_names = $fields['Public Names of Blocks'] ?? [];
    $block_string = is_array($raw_block_names) ? implode(',', $raw_block_names) : strval($raw_block_names);
    $cleaned_block_names = array_values(array_unique(array_filter(array_map('trim', explode(',', $block_string)))));

    // --- FINAL FIX FOR CUSTOMIZATIONS IS HERE ---
    $cust_ids_raw = $fields['IDs of all customizations used'] ?? [];
    $cust_ids_string = is_array($cust_ids_raw) ? implode(',', $cust_ids_raw) : strval($cust_ids_raw);
    $cleaned_cust_ids = array_values(array_unique(array_filter(array_map('trim', explode(',', $cust_ids_string)))));
    // ---------------------------------------------
    
    $workout_id_for_check = trim($workout_id ?? 'X_NO_ID_X');
    $return_link = trim($program_record_fields["Return Link"] ?? "");
    $is_done = in_array($return_link . $workout_id_for_check, $done_workouts_trimmed) || in_array($workout_id_for_check, $done_workouts_trimmed);

    return [ 
        'id' => $workout_rec['id'], 
        'workoutId' => $workout_id, 
        'title' => $workout_title, 
        'titleOverwrite' => $fields['Title Overwrite'] ?? null, 
        'accessPermission' => $fields['Access Permission'] ?? null, 
        'type' => empty($focus_area) ? 'General' : $focus_area, 
        'focusArea' => $focus_area, 
        'isWorkoutOptional'  => strtolower($fields['Type'] ?? '') === 'optional', 
        'airtableOriginalType' => $fields['Type'] ?? '', 
        'dayOfWeek' => $fields['Day of Week'] ?? null, 
        'duration' => $fields['Duration'] ?? null, 
        'Equipment' => $fields['Equipment'] ?? null, 
        'imageUrl' => $fields['img url'] ?? null, 
        'blockNames' => $cleaned_block_names, 
        'customizationsUsed' => $cleaned_cust_ids, // Use the new clean array
        'doneState' => $is_done, 
        'likeState' => false 
    ];
}, $workouts_for_week_unsorted);



            usort($final_workouts, function($a, $b) { return intval($a['dayOfWeek'] ?? 8) - intval($b['dayOfWeek'] ?? 8); });
            return ['id' => $week_rec['id'], 'Name' => $week_rec['fields']['Name'] ?? '', 'Public Name' => $week_rec['fields']['Public Name'] ?? '', 'workouts' => array_values($final_workouts) ];
        }, $week_sections_for_stage_unsorted);
        
        $intro_videos_for_stage = array_values(array_map(function($rec) { return array_merge($rec['fields'], ['id' => $rec['id']]); }, array_intersect_key($intro_video_records_map, array_flip($stage_fields['Stage Intro Videos'] ?? []))));
        $techniques_for_stage = array_values(array_map(function($rec) { return array_merge($rec['fields'], ['id' => $rec['id']]); }, array_intersect_key($technique_records_map, array_flip($stage_fields['Technique School'] ?? []))));
        $knowledge_for_stage = array_values(array_map(function($rec) { $fields = $rec['fields'] ?? []; return [ 'id' => $rec['id'], 'Title' => $fields['Title'] ?? 'Untitled Article', 'teaser text' => $fields['teaser text'] ?? '', 'time' => $fields['time'] ?? '', 'page url' => $fields['page url'] ?? null ]; }, array_intersect_key($knowledge_records_map, array_flip($stage_fields['Knowledgebase'] ?? []))));
        return [ 'id' => $stage_rec['id'], 'name' => $stage_fields["Landing Page Name"] ?? $stage_fields["Name"] ?? "(No Name)", 'goal' => $stage_fields["Goal"] ?? "", 'introVideos' => $intro_videos_for_stage, 'weekSections' => array_values($final_week_sections), 'techniques' => $techniques_for_stage, 'knowledge' => $knowledge_for_stage ];
    }, $stage_records);
    
    // 5. --- Vimeo Fetching & Final Packaging ---
    $all_vimeo_ids = [];
    foreach ($intro_video_records as $rec) { if (!empty($rec['fields']['Vimeo ID'])) { $all_vimeo_ids[] = trim($rec['fields']['Vimeo ID']); } }
    foreach ($technique_records as $rec) { if (!empty($rec['fields']['Vimeo ID'])) { $all_vimeo_ids[] = trim($rec['fields']['Vimeo ID']); } }
    $unique_vimeo_ids = array_unique(array_filter($all_vimeo_ids));
    $vimeo_metadata_cache = [];
    foreach($unique_vimeo_ids as $vimeo_id) {
        $transient_key = 'vimeo_meta_' . $vimeo_id;
        if (false !== ($cached_data = get_transient($transient_key))) {
            $vimeo_metadata_cache[$vimeo_id] = $cached_data;
        } else {
            $vimeo_url = "https://api.vimeo.com/videos/{$vimeo_id}?fields=duration,pictures.sizes,name";
            $vimeo_response = wp_remote_get($vimeo_url, ['headers' => ['Authorization' => 'bearer ' . $vimeo_api_token]]);
            if (!is_wp_error($vimeo_response) && wp_remote_retrieve_response_code($vimeo_response) === 200) {
                $metadata = json_decode(wp_remote_retrieve_body($vimeo_response), true);
                set_transient($transient_key, $metadata, 3 * HOUR_IN_SECONDS);
                $vimeo_metadata_cache[$vimeo_id] = $metadata;
            }
        }
    }

    $final_data = [
        'programRecord' => $program_record,
        'stageData' => [ 'program' => $program_record_fields, 'allStages' => $final_all_stages ],
        'clientProfile' => [ 'id' => $client_id, 'doneWorkouts' => $done_workouts, 'likeMap' => $like_map,
                             'techniqueLikeMap' => $technique_like_map, 'customizationMap' => $customization_map, ],
        'vimeoMetadata' => $vimeo_metadata_cache, 'userAccessLevel' => $user_access_level
    ];

    wp_send_json_success($final_data);
}

// HOOK FOR THE NEW PROGRAM PAGE DATA HANDLER
add_action('wp_ajax_get_program_page_data', 'vision_get_program_page_data_handler');
add_action('wp_ajax_nopriv_get_program_page_data', 'vision_get_program_page_data_handler');

/**
 * AJAX handler for unliking an article.
 */
function vision_unlike_article_handler() {
    // Security checks
    check_ajax_referer('vision_ajax_nonce', 'security');
    if (!is_user_logged_in()) {
        wp_send_json_error(['message' => 'You must be logged in to perform this action.']);
        return;
    }

    // Input validation
    if (!isset($_POST['record_id']) || empty($_POST['record_id'])) {
        wp_send_json_error(['message' => 'Error: Missing record ID.']);
        return;
    }

    $record_id_to_delete = sanitize_text_field($_POST['record_id']);

    // Get Airtable credentials securely
    $api_key  = getenv('AIRTABLE_API_KEY');
    $base_id  = getenv('AIRTABLE_PROFILE_BASE_ID');
    $table_id = 'tblQuWWaiH7uDE185'; // The 'Likes' table

    if (empty($api_key) || empty($base_id)) {
        wp_send_json_error(['message' => 'Server Error: API is not configured.']);
        return;
    }

    // Prepare the URL for the DELETE request
    $airtable_url = "https://api.airtable.com/v0/{$base_id}/{$table_id}/{$record_id_to_delete}";
    
    // Make the DELETE request from the server
    $response = wp_remote_request($airtable_url, [
        'method'  => 'DELETE',
        'headers' => ['Authorization' => 'Bearer ' . $api_key]
    ]);

    // Check for errors and send the response back to the JavaScript
    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        wp_send_json_error(['message' => 'Server Error: The unlike action could not be completed.']);
        return;
    }
    
    wp_send_json_success(json_decode(wp_remote_retrieve_body($response), true));
}

// Add this hook with your other AJAX hooks
add_action('wp_ajax_unlike_article', 'vision_unlike_article_handler');

/**
 * AJAX handler for LIKING a technique video.
 */
function vision_like_technique_handler() {
    check_ajax_referer('vision_ajax_nonce', 'security');
    if (!is_user_logged_in()) { wp_send_json_error(['message' => 'You must be logged in.']); return; }
    if (!isset($_POST['technique_id']) || empty($_POST['technique_id'])) { wp_send_json_error(['message' => 'Missing technique ID.']); return; }

    $technique_id = sanitize_text_field($_POST['technique_id']);
    $client_id = mm_member_data(['name' => 'id']);
    
    $api_key  = getenv('AIRTABLE_API_KEY');
    $base_id  = getenv('AIRTABLE_PROFILE_BASE_ID');
    $table_id = 'tblQuWWaiH7uDE185';

    if (empty($api_key) || empty($base_id)) { wp_send_json_error(['message' => 'Server Error: API is not configured.']); return; }

    $post_body = json_encode(['fields' => ['clientID' => $client_id, 'techniqueID' => $technique_id]]);
    $response = wp_remote_post("https://api.airtable.com/v0/{$base_id}/{$table_id}", [
        'headers' => ['Authorization' => 'Bearer ' . $api_key, 'Content-Type' => 'application/json'],
        'body'    => $post_body
    ]);

    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) { wp_send_json_error(['message' => 'Server Error: Like action failed.']); return; }
    
    wp_send_json_success(json_decode(wp_remote_retrieve_body($response), true));
}

/**
 * AJAX handler for UNLIKING a technique video.
 */
function vision_unlike_technique_handler() {
    check_ajax_referer('vision_ajax_nonce', 'security');
    if (!is_user_logged_in()) { wp_send_json_error(['message' => 'You must be logged in.']); return; }
    if (!isset($_POST['record_id']) || empty($_POST['record_id'])) { wp_send_json_error(['message' => 'Missing record ID.']); return; }

    $record_id_to_delete = sanitize_text_field($_POST['record_id']);
    
    $api_key  = getenv('AIRTABLE_API_KEY');
    $base_id  = getenv('AIRTABLE_PROFILE_BASE_ID');
    $table_id = 'tblQuWWaiH7uDE185';
    
    if (empty($api_key) || empty($base_id)) { wp_send_json_error(['message' => 'Server Error: API is not configured.']); return; }

    $response = wp_remote_request("https://api.airtable.com/v0/{$base_id}/{$table_id}/{$record_id_to_delete}", [
        'method'  => 'DELETE',
        'headers' => ['Authorization' => 'Bearer ' . $api_key]
    ]);

    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) { wp_send_json_error(['message' => 'Server Error: Unlike action failed.']); return; }
    
    wp_send_json_success(json_decode(wp_remote_retrieve_body($response), true));
}

// Add these hooks with your other AJAX hooks at the bottom of functions.php
add_action('wp_ajax_like_technique', 'vision_like_technique_handler');
add_action('wp_ajax_unlike_technique', 'vision_unlike_technique_handler');


// ===================================================================
// START: NEW, ISOLATED FUNCTIONS FOR THE VISION SIDEBAR
// ===================================================================

/**
 * Helper function to get only the data needed for the sidebar.
 */
function vision_sidebar_get_member_data() {
    if (!is_user_logged_in() || !function_exists('mm_member_data')) {
        return ['isLoggedIn' => false];
    }
    return [
        'isLoggedIn' => true,
        'member_id'  => mm_member_data(['name' => 'id']),
        'first_name' => mm_member_data(['name' => 'firstName']),
    ];
}

/**
 * Creates a NEW, separate JavaScript object ONLY for the sidebar.
 */
function vision_sidebar_make_data_available() {
    // 1. Register a new, unique, and safe script handle for the sidebar.
    wp_register_script('vision-sidebar-data-handle', false);
    wp_enqueue_script('vision-sidebar-data-handle');

    // 2. Get the specific data needed for the sidebar.
    $sidebar_data = vision_sidebar_get_member_data();

    // 3. Add the security nonce to our new data object.
    $sidebar_data['nonce'] = wp_create_nonce('vision_ajax_nonce');

    // 4. Attach the data, creating a NEW JavaScript object called 'visionSidebarData'.
    wp_localize_script('vision-sidebar-data-handle', 'visionSidebarData', $sidebar_data);
}
// Hook our new function into WordPress.
add_action('wp_enqueue_scripts', 'vision_sidebar_make_data_available', 100);

/**
 * NEW, separate AJAX handler for creating a member from the sidebar.
 */
function vision_sidebar_create_member_handler() {
    // Verifies the 'security' token sent from the JavaScript.
    check_ajax_referer('vision_ajax_nonce', 'security');

    if (!isset($_POST['email'])) {
        wp_send_json_error(['message' => 'Missing required fields.']);
        return;
    }

    $first_name = sanitize_text_field($_POST['first_name']);
    $last_name = sanitize_text_field($_POST['last_name']);
    $email = sanitize_email($_POST['email']);
    $password = $_POST['password'];

    // Securely get the credentials from your .env file
    $api_key = getenv('MM_API_KEY');
    $api_secret = getenv('MM_SECRET_KEY');

    if (empty($api_key) || empty($api_secret)) {
        wp_send_json_error(['message' => 'API credentials are not configured on the server.']);
        return;
    }

    $membership_level_id = '1';
    $api_url = 'https://courses.coachbachmann.com/wp-content/plugins/membermouse/api/request.php';

    $request_url = add_query_arg([
        'q' => '/createMember',
        'apikey' => $api_key,
        'apisecret' => $api_secret,
        'membership_level_id' => $membership_level_id,
        'first_name' => $first_name,
        'last_name' => $last_name,
        'email' => $email,
        'password' => $password
    ], $api_url);

    $response = wp_remote_post($request_url, ['timeout' => 20]);

    if (is_wp_error($response)) {
        $error_message = $response->get_error_message();
        wp_send_json_error(['message' => 'Could not connect to the membership server.', 'debug_info' => $error_message]);
        return;
    }

    $http_code = wp_remote_retrieve_response_code($response);
    if ($http_code != 200) {
        if ($http_code == 401) {
             wp_send_json_error(['message' => 'API credentials invalid. Please check your MemberMouse API keys.']);
        } else {
             wp_send_json_error(['message' => 'The membership server returned an error.', 'debug_info' => 'HTTP Status Code: ' . $http_code]);
        }
        return;
    }
    $body = wp_remote_retrieve_body($response);
    $json_body = json_decode(substr($body, strpos($body, '{'), strrpos($body, '}') - strpos($body, '{') + 1), true);

    if ($json_body && isset($json_body['response_code']) && $json_body['response_code'] === '200') {
        wp_send_json_success($json_body);
    } else {
        $error_message = $json_body['response_message'] ?? 'An unknown error occurred during sign-up.';
        wp_send_json_error(['message' => $error_message]);
    }
}
// Hook the new AJAX handler for non-logged-in users.
add_action('wp_ajax_nopriv_vision_sidebar_create_member', 'vision_sidebar_create_member_handler');

// ===================================================================
// END: NEW, ISOLATED FUNCTIONS FOR THE VISION SIDEBAR
// ===================================================================

function vision_secure_create_member_handler() {
    // Security check
    check_ajax_referer('vision_ajax_nonce', 'security');

    // Input validation
    if (!isset($_POST['email']) || !isset($_POST['first_name']) || !isset($_POST['last_name']) || !isset($_POST['password'])) {
        wp_send_json_error(['message' => 'Missing required fields.']);
        return;
    }

    // Sanitize all inputs
    $first_name = sanitize_text_field($_POST['first_name']);
    $last_name  = sanitize_text_field($_POST['last_name']);
    $email      = sanitize_email($_POST['email']);
    $password   = $_POST['password']; // Password should not be sanitized in a way that alters it

    // Get API credentials from server environment
    $api_key    = getenv('MM_API_KEY');
    $api_secret = getenv('MM_SECRET_KEY');

    if (empty($api_key) || empty($api_secret)) {
        wp_send_json_error(['message' => 'API credentials are not configured on the server.']);
        return;
    }

    $membership_level_id = '1'; // Default free membership
    $api_url = 'https://courses.coachbachmann.com/wp-content/plugins/membermouse/api/request.php?q=/createMember';

    // Prepare data for the POST request
    $body = [
        'apikey'              => $api_key,
        'apisecret'           => $api_secret,
        'membership_level_id' => $membership_level_id,
        'first_name'          => $first_name,
        'last_name'           => $last_name,
        'email'               => $email,
        'password'            => $password
    ];

    // Make the API call to MemberMouse to create the member
    $response = wp_remote_post($api_url, [
        'timeout' => 20,
        'body'    => $body
    ]);

    // Handle connection errors
    if (is_wp_error($response)) {
        wp_send_json_error([
            'message' => 'Could not connect to the membership server.', 
            'debug_info' => $response->get_error_message()
        ]);
        return;
    }
    
    // Handle non-200 HTTP responses
    $http_code = wp_remote_retrieve_response_code($response);
    if ($http_code != 200) {
        wp_send_json_error([
            'message' => "The membership server returned an error.",
            'debug_info' => 'HTTP Status Code: ' . $http_code
        ]);
        return;
    }

    // Process the successful response from MemberMouse
    $response_body = wp_remote_retrieve_body($response);
    // Clean the response which is sometimes wrapped in "MM_API_SUCCESS :: (JSON)"
    $json_str = substr($response_body, strpos($response_body, '{'));
    $json_body = json_decode($json_str, true);

    if ($json_body && isset($json_body['response_code']) && $json_body['response_code'] === '200') {
        // =================================================================
        // NEW LOGIC: Extract the new member ID and add it to our response
        // =================================================================
        $new_member_id = $json_body['response_message']['member_id'] ?? null;
        
        if ($new_member_id) {
            // Add the new ID to the data we're sending back to the browser
            $success_data = [
                'message'       => 'User created successfully.',
                'new_member_id' => $new_member_id
            ];
            wp_send_json_success($success_data);
        } else {
            // This is a failsafe in case the MM response changes
            wp_send_json_error(['message' => 'MemberMouse created the user but did not return a member ID.']);
        }
        // =================================================================

    } else {
        // Handle errors reported by the MemberMouse API itself (e.g., "Email already in use")
        $error_message = $json_body['response_message'] ?? 'An unknown error occurred during sign-up.';
        wp_send_json_error(['message' => $error_message]);
    }
}
add_action('wp_ajax_nopriv_vision_secure_create_member', 'vision_secure_create_member_handler');

function vision_secure_avatar_upload_handler() {
    check_ajax_referer('vision_ajax_nonce', 'security');

    if (
        empty($_FILES['avatar']) ||
        empty($_POST['clientId'])
    ) {
        wp_send_json_error(['message' => 'Missing avatar or clientId']);
        return;
    }

    $clientId = sanitize_text_field($_POST['clientId']);
    $avatar_file = $_FILES['avatar']['tmp_name'];

    if (!$clientId || !$avatar_file) {
        wp_send_json_error(['message' => 'Invalid input.']);
        return;
    }

    // Get env variables securely
    $cloudinary_cloud_name = getenv('CLOUDINARY_CLOUD_NAME');
    $upload_preset = getenv('UPLOAD_PRESET');
    $airtable_api_key = getenv('AIRTABLE_API_KEY2');
    $airtable_base_id = getenv('AIRTABLE_BASE_ID2');
    $airtable_table_id = getenv('AIRTABLE_TABLE_ID2');

    if (!$cloudinary_cloud_name || !$upload_preset || !$airtable_api_key || !$airtable_base_id || !$airtable_table_id) {
        wp_send_json_error(['message' => 'Server misconfiguration.']);
        return;
    }

    // Upload to Cloudinary
    $upload_url = "https://api.cloudinary.com/v1_1/{$cloudinary_cloud_name}/image/upload";
    $ch = curl_init($upload_url);
    $postData = [
        'file' => new CURLFile($avatar_file),
        'upload_preset' => $upload_preset,
        'folder' => 'profile-pics',
    ];

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $postData,
    ]);

    $cloudinary_response = curl_exec($ch);
    $cloudinary_result = json_decode($cloudinary_response, true);
    curl_close($ch);

    if (!isset($cloudinary_result['secure_url'])) {
        wp_send_json_error(['message' => 'Cloudinary upload failed']);
        return;
    }

    $avatar_url = $cloudinary_result['secure_url'];

    // Check Airtable for record
    $filter_formula = "filterByFormula=" . urlencode("MemberID='{$clientId}'");
    $airtable_url = "https://api.airtable.com/v0/{$airtable_base_id}/{$airtable_table_id}?{$filter_formula}";

    $headers = [
        "Authorization: Bearer {$airtable_api_key}",
        "Content-Type: application/json",
    ];

    $get_response = wp_remote_get($airtable_url, ['headers' => $headers]);
    $get_data = json_decode(wp_remote_retrieve_body($get_response), true);
    $record_id = $get_data['records'][0]['id'] ?? null;

    $airtable_payload = $record_id
        ? ['records' => [[
            'id' => $record_id,
            'fields' => ['Avatar' => $avatar_url]
        ]]]
        : ['records' => [[
            'fields' => ['MemberID' => $clientId, 'Avatar' => $avatar_url]
        ]]];

    $method = $record_id ? 'PATCH' : 'POST';

    $update_response = wp_remote_request("https://api.airtable.com/v0/{$airtable_base_id}/{$airtable_table_id}", [
        'method' => $method,
        'headers' => $headers,
        'body' => wp_json_encode($airtable_payload),
    ]);

    if (is_wp_error($update_response)) {
        wp_send_json_error(['message' => 'Airtable update failed.']);
        return;
    }

    wp_send_json_success([
        'message' => 'Avatar uploaded and saved successfully.',
        'avatar_url' => $avatar_url,
    ]);
}
add_action('wp_ajax_nopriv_vision_secure_avatar_upload', 'vision_secure_avatar_upload_handler');
add_action('wp_ajax_vision_secure_avatar_upload', 'vision_secure_avatar_upload_handler');

/**
 * ===================================================================
 * START: DEDICATED FUNCTIONS FOR EXERCISE LIBRARY PAGE
 * ===================================================================
 */

/**
 * A new, dedicated helper function to make a paginated request to an Airtable table.
 * It has detailed error reporting built in.
 *
 * @param string $base_id   The Airtable Base ID.
 * @param string $table     The Airtable Table Name or ID.
 * @param array  $options   Optional parameters like 'fields' or 'filterByFormula'.
 * @return array|WP_Error   An array of records or a WP_Error on failure.
 */
function vision_exlib_airtable_request($base_id, $table, $options = []) {
    $api_key = getenv('AIRTABLE_API_KEY');
    if (empty($api_key) || empty($base_id) || empty($table)) {
        return new WP_Error('config_error', 'Server is missing API Key, Base ID, or Table Name.');
    }

    $all_records = [];
    $offset = null;
    
    // Base URL structure
    $url = "https://api.airtable.com/v0/{$base_id}/" . rawurlencode($table);

    // Prepare query arguments
    $query_args = [];
    if (!empty($options['fields'])) {
        $query_args['fields'] = $options['fields'];
    }
    if (!empty($options['filterByFormula'])) {
        $query_args['filterByFormula'] = $options['filterByFormula'];
    }
     if (!empty($options['view'])) {
        $query_args['view'] = $options['view'];
    }

    do {
        if ($offset) {
            $query_args['offset'] = $offset;
        }

        $request_url = add_query_arg($query_args, $url);

        $response = wp_remote_get($request_url, [
            'headers' => ['Authorization' => 'Bearer ' . $api_key],
            'timeout' => 20,
        ]);

        if (is_wp_error($response)) {
            return new WP_Error('wp_error', 'WordPress HTTP Error: ' . $response->get_error_message());
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);

        if ($response_code !== 200) {
            $error_message = "Airtable API Error. Status: {$response_code}. Table: {$table}. Response: {$response_body}";
            return new WP_Error('airtable_api_error', $error_message);
        }

        $data = json_decode($response_body, true);
        if (isset($data['records'])) {
            $all_records = array_merge($all_records, $data['records']);
        }
        $offset = $data['offset'] ?? null;

    } while ($offset);

    return $all_records;
}

/**
 * The main AJAX handler for the exercise library page. (VERSION 4 - FINAL with Caching)
 * Securely fetches data and caches public content for performance.
 */
function vision_exlib_fetch_data_handler() {
    check_ajax_referer('vision_ajax_nonce', 'security');

    // --- Caching Setup ---
    $upload_dir = wp_upload_dir();
    $cache_dir = $upload_dir['basedir'] . '/app-cache'; // Make sure this directory exists and is writable
    if (!is_dir($cache_dir)) {
        wp_mkdir_p($cache_dir);
    }
    $cache_life = 15 * 60; // Cache for 15 minutes

    // --- 0. Get MemberMouse Data (Always fresh, never cached) ---
    $member_info = [
        'id'             => null,
        'firstName'      => '',
        'isMember'       => false,
        'membershipName' => ''
    ];
    if (is_user_logged_in() && function_exists('mm_member_data')) {
        $member_info['id'] = mm_member_data(['name' => 'id']);
        $member_info['firstName'] = mm_member_data(['name' => 'firstName']);
        $member_info['isMember'] = mm_member_decision(['isMember' => true]);
        $member_info['membershipName'] = strtolower(mm_member_data(['name' => 'membershipName']));
    }

    $workout_base_id = getenv('WORKOUT_DATA_BASE_ID');
    $profile_base_id = getenv('AIRTABLE_PROFILE_BASE_ID');

    // --- 1. Fetch Workout Library Data (with Caching) ---
    $library_cache_file = $cache_dir . '/exlib_library_data.json';
    if (file_exists($library_cache_file) && (time() - filemtime($library_cache_file)) < $cache_life) {
        $library_workouts = json_decode(file_get_contents($library_cache_file), true);
    } else {
        $library_workouts = vision_exlib_airtable_request($workout_base_id, 'Workout Library', ['view' => 'Grid view']);
        if (is_wp_error($library_workouts)) {
            wp_send_json_error(['message' => 'Failed to fetch Workout Library. Reason: ' . $library_workouts->get_error_message()]);
            return;
        }
        file_put_contents($library_cache_file, json_encode($library_workouts));
    }

    // --- 2. Fetch Follow Along Workouts Data (with Caching) ---
    $follow_along_cache_file = $cache_dir . '/exlib_follow_along_data.json';
    if (file_exists($follow_along_cache_file) && (time() - filemtime($follow_along_cache_file)) < $cache_life) {
        $follow_along_workouts = json_decode(file_get_contents($follow_along_cache_file), true);
    } else {
$follow_along_workouts = vision_exlib_airtable_request($workout_base_id, 'Follow Along Workouts', [
    'filterByFormula' => "NOT({vimeo} = '')"
]);
		if (is_wp_error($follow_along_workouts)) {
            wp_send_json_error(['message' => 'Failed to fetch Follow Along data. Reason: ' . $follow_along_workouts->get_error_message()]);
            return;
        }
        file_put_contents($follow_along_cache_file, json_encode($follow_along_workouts));
    }
    
    // --- 3. Fetch User-Specific Data (Always fresh, never cached) ---
    $liked_workouts = [];
    $customization_map = [];
    $client_id = $member_info['id'];
    if ($client_id) {
        // ... (The rest of the user-specific logic remains the same) ...
        $liked_records = vision_exlib_airtable_request($profile_base_id, 'tblQuWWaiH7uDE185', [
            'filterByFormula' => "{clientID}='" . $client_id . "'",
            'fields' => ['workoutID']
        ]);
        if (!is_wp_error($liked_records)) {
            $liked_workouts = $liked_records;
        }

        $all_level_ids = [];
        foreach ($library_workouts as $workout) {
            if (!empty($workout['fields']['MemberLevel']) || !empty($workout['fields']['memberLevel'])) {
                $levels_raw = $workout['fields']['MemberLevel'] ?? $workout['fields']['memberLevel'];
                $levels_str = is_array($levels_raw) ? implode(',', $levels_raw) : strval($levels_raw);
                $level_ids = array_filter(array_map('trim', explode(',', $levels_str)));
                $all_level_ids = array_merge($all_level_ids, $level_ids);
            }
        }
        $unique_level_ids = array_unique(array_filter($all_level_ids));
        if (!empty($unique_level_ids)) {
            $formula_parts = array_map(function($id) { return "{levelid}='" . $id . "'"; }, $unique_level_ids);
            $formula = "AND({clientid}='" . $client_id . "', OR(" . implode(",", $formula_parts) . "))";
            $customization_records = vision_exlib_airtable_request($profile_base_id, 'tblKMLKyuNg5HsuzW', ['filterByFormula' => $formula, 'fields' => ['levelid']]);
            if (!is_wp_error($customization_records)) {
                foreach($customization_records as $record) {
                    if (!empty($record['fields']['levelid'])) {
                        $customization_map[trim($record['fields']['levelid'])] = true;
                    }
                }
            }
        }
    }

    // --- 4. Send the final combined response ---
    wp_send_json_success([
        'memberInfo'          => $member_info,
        'libraryWorkouts'     => $library_workouts,
        'followAlongWorkouts' => $follow_along_workouts,
        'likedWorkouts'       => $liked_workouts,
        'customizationMap'    => $customization_map,
    ]);
}

// Hook the new handler for both logged-in and non-logged-in users.
add_action('wp_ajax_vision_exlib_fetch_data', 'vision_exlib_fetch_data_handler');
add_action('wp_ajax_nopriv_vision_exlib_fetch_data', 'vision_exlib_fetch_data_handler');

/**
 * ===================================================================
 * END: DEDICATED FUNCTIONS FOR EXERCISE LIBRARY PAGE
 * ===================================================================
 */

/**
 * ===================================================================
 * SECURE AJAX HANDLERS FOR PROFILE PAGE
 * ===================================================================
 */

/**
 * AJAX handler for updating a member's profile data in MemberMouse.
 */
function vision_update_member_profile_handler() {
    check_ajax_referer('vision_ajax_nonce', 'security');

    if (!is_user_logged_in() || !function_exists('mm_member_data')) {
        wp_send_json_error(['message' => 'You must be logged in to update your profile.']);
        return;
    }

    // Get the member ID from the current session for security
    $member_id = mm_member_data(['name' => 'id']);
    if (empty($member_id)) {
        wp_send_json_error(['message' => 'Could not identify the current member.']);
        return;
    }
    
    // Get API credentials securely from the server environment
    $api_key = getenv('MM_API_KEY');
    $api_secret = getenv('MM_SECRET_KEY');

    if (empty($api_key) || empty($api_secret)) {
        wp_send_json_error(['message' => 'API credentials are not configured on the server.']);
        return;
    }

    // The base URL for the API command
    $api_url = 'https://courses.coachbachmann.com/wp-content/plugins/membermouse/api/request.php?q=/updateMember';
    
    // An array of parameters to be sent in the POST body
    $body_data = [
        'apikey'                  => $api_key,
        'apisecret'               => $api_secret,
        'member_id'               => $member_id,
        'first_name'              => isset($_POST['first_name']) ? sanitize_text_field($_POST['first_name']) : null,
        'last_name'               => isset($_POST['last_name']) ? sanitize_text_field($_POST['last_name']) : null,
        'username'                => isset($_POST['username']) ? sanitize_text_field($_POST['username']) : null,
        'billing_country'         => isset($_POST['billing_country']) ? sanitize_text_field($_POST['billing_country']) : null,
    ];
    
    // Filter out any null values so we don't send empty parameters
    $body_data = array_filter($body_data, function($value) {
        return !is_null($value);
    });

    // Make the POST request with the credentials and data in the 'body' array
    $response = wp_remote_post($api_url, [
        'timeout' => 20,
        'body'    => $body_data,
    ]);

    if (is_wp_error($response)) {
        wp_send_json_error(['message' => 'Failed to connect to the membership server.']);
        return;
    }

    $body = wp_remote_retrieve_body($response);
    // The MemberMouse API returns a string like "MM_API_SUCCESS :: (JSON_DATA_HERE)" so we extract the JSON
    $json_str = substr($body, strpos($body, '{'));
    $result = json_decode($json_str, true);

    if ($result && isset($result['response_code']) && $result['response_code'] === '200') {
        wp_send_json_success($result);
    } else {
        $error_message = $result['response_message'] ?? 'An unknown error occurred during profile update.';
        wp_send_json_error(['message' => $error_message]);
    }
}
add_action('wp_ajax_vision_update_profile', 'vision_update_member_profile_handler');

/**
 * AJAX handler for fetching the current user's avatar URL from Airtable.
 */
function vision_get_avatar_url_handler() {
    check_ajax_referer('vision_ajax_nonce', 'security');
    if (!is_user_logged_in() || !function_exists('mm_member_data')) {
        wp_send_json_error(['message' => 'Not logged in.']);
        return;
    }

    $client_id = mm_member_data(['name' => 'id']);
    $api_key   = getenv('AIRTABLE_API_KEY');
    $base_id   = getenv('AIRTABLE_PROFILE_BASE_ID');
    $table_id  = getenv('AIRTABLE_AVATAR_TABLE_ID');

    if (empty($client_id) || empty($api_key) || empty($base_id) || empty($table_id)) {
        wp_send_json_error(['message' => 'Server configuration error.']);
        return;
    }

    $formula      = urlencode("MemberID='{$client_id}'");
    $airtable_url = "https://api.airtable.com/v0/{$base_id}/{$table_id}?filterByFormula={$formula}";
    $response     = wp_remote_get($airtable_url, ['headers' => ['Authorization' => 'Bearer ' . $api_key]]);

    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        wp_send_json_error(['message' => 'Could not fetch avatar record from server.']);
        return;
    }

    $data = json_decode(wp_remote_retrieve_body($response), true);
    $avatar_url = $data['records'][0]['fields']['Avatar'] ?? '';
    
    wp_send_json_success(['avatar_url' => $avatar_url]);
}
add_action('wp_ajax_vision_get_avatar_url', 'vision_get_avatar_url_handler');

/**
 * AJAX handler for uploading a new avatar.
 * Handles upload to Cloudinary and then updates the record in Airtable.
 */
function vision_upload_avatar_handler() {
    check_ajax_referer('vision_ajax_nonce', 'security');
    if (!is_user_logged_in() || !function_exists('mm_member_data')) { wp_send_json_error(['message' => 'Not logged in.']); return; }
    if (empty($_FILES['avatar'])) { wp_send_json_error(['message' => 'No file was uploaded.']); return; }

    // Get credentials
    $client_id             = mm_member_data(['name' => 'id']);
    $cloudinary_cloud_name = getenv('CLOUDINARY_CLOUD_NAME');
    $upload_preset         = getenv('UPLOAD_PRESET');
    $airtable_api_key      = getenv('AIRTABLE_API_KEY'); // Use the main key
    $airtable_base_id      = getenv('AIRTABLE_PROFILE_BASE_ID');
    $airtable_table_id     = getenv('AIRTABLE_AVATAR_TABLE_ID');

    // 1. Upload to Cloudinary using cURL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://api.cloudinary.com/v1_1/{$cloudinary_cloud_name}/image/upload");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, [
        'file'          => new CURLFile($_FILES['avatar']['tmp_name']),
        'upload_preset' => $upload_preset,
        'folder'        => 'profile-pics'
    ]);
    $cloudinary_response = curl_exec($ch);
    curl_close($ch);
    $cloudinary_result = json_decode($cloudinary_response, true);

    if (!isset($cloudinary_result['secure_url'])) {
        wp_send_json_error(['message' => 'Image server upload failed.', 'debug' => $cloudinary_result]);
        return;
    }
    $new_avatar_url = $cloudinary_result['secure_url'];

    // 2. Find existing Airtable record
    $find_url = "https://api.airtable.com/v0/{$airtable_base_id}/{$airtable_table_id}?filterByFormula=" . urlencode("MemberID='{$client_id}'");
    $headers = ['Authorization' => 'Bearer ' . $airtable_api_key, 'Content-Type' => 'application/json'];
    $find_response = wp_remote_get($find_url, ['headers' => $headers]);
    $find_data = json_decode(wp_remote_retrieve_body($find_response), true);
    $record_id = $find_data['records'][0]['id'] ?? null;

    // 3. Create or Update Airtable record
    $airtable_url = "https://api.airtable.com/v0/{$airtable_base_id}/{$airtable_table_id}";
    $method = $record_id ? 'PATCH' : 'POST';
    $payload = $record_id 
        ? ['records' => [['id' => $record_id, 'fields' => ['Avatar' => $new_avatar_url]]]]
        : ['records' => [['fields' => ['MemberID' => $client_id, 'Avatar' => $new_avatar_url]]]];

    $update_response = wp_remote_request($airtable_url, [
        'method'  => $method,
        'headers' => $headers,
        'body'    => json_encode($payload)
    ]);

    if(is_wp_error($update_response) || wp_remote_retrieve_response_code($update_response) !== 200) {
        wp_send_json_error(['message' => 'Could not save the new avatar URL.']);
        return;
    }
    
    wp_send_json_success(['message' => 'Avatar updated!', 'avatar_url' => $new_avatar_url]);
}
add_action('wp_ajax_vision_upload_avatar', 'vision_upload_avatar_handler');



/**
 * ===================================================================
 * SECURE & FAST LOADER FOR THE PROFILE PAGE
 * - This function is self-contained and only runs on the profile page.
 * - It pre-loads ALL necessary data from MemberMouse & Airtable APIs.
 * ===================================================================
 */
/**
 * ===================================================================
 * SECURE & FAST LOADER FOR THE PROFILE PAGE (DEBUGGING VERSION)
 * - This function will now capture and output any API errors.
 * ===================================================================
 */
function vision_profile_page_data_loader() {
    
    if ( !is_page('profile') ) { 
        return;
    }

    $profile_data = [
        'isLoggedIn' => false,
        'ajax_url'   => admin_url('admin-ajax.php'),
        'nonce'      => wp_create_nonce('vision_ajax_nonce'),
        'memberData' => [],
        'debug_info' => [] // We will put error messages here
    ];

    if (is_user_logged_in() && function_exists('mm_member_data')) {
        $profile_data['isLoggedIn'] = true;
        $client_id = mm_member_data(['name' => 'id']);
        
        $mm_api_key = getenv('MM_API_KEY');
        $mm_api_secret = getenv('MM_SECRET_KEY');

        // 1. --- Get ALL MemberMouse data via one fast API call ---
        if ($client_id && $mm_api_key && $mm_api_secret) {
            $mm_api_url = 'https://courses.coachbachmann.com/wp-content/plugins/membermouse/api/request.php?q=/getMember&member_id=' . $client_id . '&apikey=' . $mm_api_key . '&apisecret=' . $mm_api_secret;
            $mm_response = wp_remote_get($mm_api_url, ['timeout' => 20]);

            if (is_wp_error($mm_response)) {
                // --- DEBUG: Catch WordPress connection errors ---
                $profile_data['debug_info']['mm_error'] = 'WordPress HTTP Error: ' . $mm_response->get_error_message();
            } else if (wp_remote_retrieve_response_code($mm_response) !== 200) {
                // --- DEBUG: Catch non-200 responses from MemberMouse (like 401, 403, 500) ---
                $profile_data['debug_info']['mm_error'] = 'MemberMouse returned a non-200 status code.';
                $profile_data['debug_info']['mm_status_code'] = wp_remote_retrieve_response_code($mm_response);
                $profile_data['debug_info']['mm_response_body'] = wp_remote_retrieve_body($mm_response);
            } else {
                // --- The request was successful, now let's check the content ---
                $mm_body = wp_remote_retrieve_body($mm_response);
                $mm_json_str = substr($mm_body, strpos($mm_body, '{'));
                $mm_result = json_decode($mm_json_str, true);

                if ($mm_result && $mm_result['response_code'] === '200') {
                    $profile_data['memberData'] = $mm_result['response_message'];
					$profile_data['debug_info']['mm_success_response'] = $mm_result;
                } else {
                    // --- DEBUG: Catch errors within the MemberMouse JSON response ---
                    $profile_data['debug_info']['mm_error'] = 'MemberMouse API call was successful, but returned an internal error.';
                    $profile_data['debug_info']['mm_full_response'] = $mm_result;
                }
            }
        } else {
            $profile_data['debug_info']['mm_error'] = 'Missing client_id or MemberMouse API credentials.';
        }

        // 2. --- Get Airtable Avatar URL (we know this part works, but let's keep it) ---
        $at_api_key   = getenv('AIRTABLE_API_KEY');
        $at_base_id   = getenv('AIRTABLE_PROFILE_BASE_ID');
        $at_table_id  = getenv('AIRTABLE_AVATAR_TABLE_ID');

        if ($client_id && $at_api_key && $at_base_id && $at_table_id) {
            $formula      = urlencode("MemberID='{$client_id}'");
            $airtable_url = "https://api.airtable.com/v0/{$at_base_id}/{$at_table_id}?filterByFormula={$formula}&fields[]=Avatar";
            $response     = wp_remote_get($airtable_url, ['headers' => ['Authorization' => 'Bearer ' . $at_api_key]]);

            if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
                $airtable_body = json_decode(wp_remote_retrieve_body($response), true);
                $profile_data['memberData']['avatar_url'] = $airtable_body['records'][0]['fields']['Avatar'] ?? '';
            }
        }
    }
    
    wp_localize_script('jquery', 'visionProfileData', $profile_data);
}
add_action('wp_enqueue_scripts', 'vision_profile_page_data_loader', 10); // Use a standard priority


/**
 * ===================================================================
 * START: NEW FUNCTION TO FIX KNOWLEDGEBASE LIKES
 * ===================================================================
 */

/**
 * AJAX handler for LIKING an article.
 * This function was created to handle the missing 'like_article' action.
 */
function vision_like_article_handler() {
    // 1. Security check to make sure the request is valid.
    check_ajax_referer('vision_ajax_nonce', 'security');

    // 2. Make sure the user is logged in.
    if (!is_user_logged_in() || !function_exists('mm_member_data')) {
        wp_send_json_error(['message' => 'You must be logged in to like an article.']);
        return;
    }

    // 3. Check for the required 'article_id' from the JavaScript.
    if (!isset($_POST['article_id']) || empty($_POST['article_id'])) {
        wp_send_json_error(['message' => 'Missing required article ID.']);
        return;
    }

    // 4. Sanitize inputs and get credentials.
    $article_id = sanitize_text_field($_POST['article_id']);
    $client_id = mm_member_data(['name' => 'id']);
    
    $api_key  = getenv('AIRTABLE_API_KEY');
    $base_id  = getenv('AIRTABLE_PROFILE_BASE_ID');
    $table_id = 'tblQuWWaiH7uDE185'; // This is the 'Likes' table ID.

    if (empty($api_key) || empty($base_id)) {
        wp_send_json_error(['message' => 'Server Error: API is not configured.']);
        return;
    }

    // 5. Prepare the data to be sent to Airtable.
    // The 'Likes' table has two important fields: 'clientID' and 'articleID'.
    $post_body = json_encode([
        'fields' => [
            'clientID'  => $client_id,
            'articleID' => $article_id
        ]
    ]);

    // 6. Make the API call to create the new "like" record in Airtable.
    $response = wp_remote_post("https://api.airtable.com/v0/{$base_id}/{$table_id}", [
        'headers' => [
            'Authorization' => 'Bearer ' . $api_key,
            'Content-Type'  => 'application/json'
        ],
        'body'    => $post_body
    ]);

    // 7. Check for errors and send the result back to the JavaScript.
    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        wp_send_json_error(['message' => 'Server Error: The like action failed.']);
        return;
    }
    
    // On success, send the new record data back to the browser.
    wp_send_json_success(json_decode(wp_remote_retrieve_body($response), true));
}

// This line tells WordPress to run our new function when it receives the 'like_article' action.
add_action('wp_ajax_like_article', 'vision_like_article_handler');

/**
 * ===================================================================
 * END: NEW FUNCTION TO FIX KNOWLEDGEBASE LIKES
 * ===================================================================
 */


/**
 * ===================================================================
 * NEW: AJAX handler specifically for the Wizard sign-up process.
 * This creates the member AND saves their wizard answers in one step.
 * ===================================================================
 */
function vision_wizard_signup_and_save_handler() {
    // 1. Security check
    check_ajax_referer('vision_ajax_nonce', 'security');

    // 2. Validate all required inputs are present
    if (!isset($_POST['email'], $_POST['first_name'], $_POST['last_name'], $_POST['password'], $_POST['answers'])) {
        wp_send_json_error(['message' => 'A required field is missing.']);
        return;
    }

    // 3. Sanitize user creation data
    $first_name = sanitize_text_field($_POST['first_name']);
    $last_name  = sanitize_text_field($_POST['last_name']);
    $email      = sanitize_email($_POST['email']);
    $password   = $_POST['password'];

    // 4. Create the Member using MemberMouse API
    $mm_api_key    = getenv('MM_API_KEY');
    $mm_api_secret = getenv('MM_SECRET_KEY');
    if (empty($mm_api_key) || empty($mm_api_secret)) {
        wp_send_json_error(['message' => 'API credentials are not configured.']);
        return;
    }
    $mm_api_url = 'https://courses.coachbachmann.com/wp-content/plugins/membermouse/api/request.php?q=/createMember';
    $mm_body = [
        'apikey' => $mm_api_key, 'apisecret' => $mm_api_secret, 'membership_level_id' => '1',
        'first_name' => $first_name, 'last_name' => $last_name, 'email' => $email, 'password' => $password
    ];
    $mm_response = wp_remote_post($mm_api_url, ['timeout' => 20, 'body' => $mm_body]);

    if (is_wp_error($mm_response) || wp_remote_retrieve_response_code($mm_response) !== 200) {
        wp_send_json_error(['message' => 'Could not connect to the membership server.']);
        return;
    }

    $mm_response_body = wp_remote_retrieve_body($mm_response);
    $mm_json_str = substr($mm_response_body, strpos($mm_response_body, '{'));
    $mm_json_body = json_decode($mm_json_str, true);

    if (!$mm_json_body || !isset($mm_json_body['response_code']) || $mm_json_body['response_code'] !== '200') {
        $error_message = $mm_json_body['response_message'] ?? 'An unknown error occurred during sign-up.';
        wp_send_json_error(['message' => $error_message]);
        return;
    }

    $new_member_id = $mm_json_body['response_message']['member_id'] ?? null;
    if (!$new_member_id) {
        wp_send_json_error(['message' => 'Member created, but their new ID could not be retrieved. Answers not saved.']);
        return;
    }

    // 5. Save the Wizard Answers to Airtable
    $answers = json_decode(stripslashes($_POST['answers']), true);
    if (is_array($answers) && !empty($answers)) {
        
        $airtable_api_key  = getenv('AIRTABLE_API_KEY');
        $airtable_base_id  = getenv('AIRTABLE_PROFILE_BASE_ID');
        $airtable_table_id = getenv('WIZARD_ANSWERS_TABLE_ID');

        if ($airtable_api_key && $airtable_base_id && $airtable_table_id) {
            $records_to_create = [];
            foreach ($answers as $answer) {
                 $records_to_create[] = ['fields' => [
                     'clientid' => strval($new_member_id), // Use the new member ID
                     'levelid'  => sanitize_text_field($answer['levelid']),
                     'level'    => sanitize_text_field($answer['level']),
                 ]];
            }

            if (!empty($records_to_create)) {
                $airtable_url = "https://api.airtable.com/v0/{$airtable_base_id}/{$airtable_table_id}";
                $post_body = json_encode(['records' => $records_to_create]);
                // We use 'blocking' => false to send the request and not wait for Airtable's response.
                // This makes the user's experience faster.
                wp_remote_post($airtable_url, [
                    'headers' => ['Authorization' => 'Bearer ' . $airtable_api_key, 'Content-Type' => 'application/json'], 
                    'body' => $post_body,
                    'blocking' => false 
                ]);
            }
        }
    }

    // 6. Send a final success response back to the browser
    wp_send_json_success([
        'message' => 'User created and answers successfully submitted.',
        'new_member_id' => $new_member_id
    ]);
}
// Hook our new function to a new, unique AJAX action name.
add_action('wp_ajax_nopriv_vision_wizard_signup_and_save', 'vision_wizard_signup_and_save_handler');

// ===================================================================
// START: NEW AJAX HANDLERS FOR VISION CUSTOMIZATION PAGE
// These functions move the data fetching from the client's browser to the server.
// ===================================================================

/**
 * Main AJAX handler to fetch all necessary data for the custom workout page in a single request.
 * This includes the workout HTML, filtering rules, and the current user's saved levels.
 */
function vision_get_custom_workout_data_handler() {
    // 1. Security & Input Validation
    check_ajax_referer('vision_ajax_nonce', 'security');
    if (!isset($_POST['workout_id']) || empty($_POST['workout_id'])) {
        wp_send_json_error(['message' => 'Error: Workout ID is missing.']);
        return;
    }
    $workout_id = sanitize_text_field($_POST['workout_id']);
    $member_id = is_user_logged_in() && function_exists('mm_member_data') ? mm_member_data(['name' => 'id']) : null;
    $api_key = getenv('AIRTABLE_API_KEY');

    // 2. Fetch Main Workout Content (including the large HTML block)
    $workout_base_id = getenv('WORKOUT_DATA_BASE_ID');
    $workout_table_name = 'Workout Library';
    $workout_records = vision_airtable_paginated_request($workout_base_id, $workout_table_name, [
        'filterByFormula' => "{id} = \"{$workout_id}\""
    ]);

    if (is_wp_error($workout_records) || empty($workout_records)) {
        wp_send_json_error(['message' => 'Could not find the specified workout.']);
        return;
    }
    $workout_record = $workout_records[0];
    $workout_data = [
        'htmlContent'  => $workout_record['fields']['Workout HTML for API'] ?? '<p>Error: Workout content is missing.</p>',
        'previewURL'   => $workout_record['fields']['Preview Video URL'] ?? null,
		'requiredLevelIds' => $workout_record['fields']['memberLevel'] ?? [],
    ];

    // 3. Fetch Field Definitions for Filtering
    $questions_base_id = getenv('WIZARD_QUESTIONS_BASE_ID');
    $questions_table_id = getenv('WIZARD_QUESTIONS_TABLE_ID');
    $field_definitions = vision_airtable_paginated_request($questions_base_id, $questions_table_id);
    
    if (is_wp_error($field_definitions)) {
        wp_send_json_error(['message' => 'Could not load workout filter definitions.']);
        return;
    }

    // 4. Fetch User's Specific Levels (if logged in)
    $client_levels = [];
    if ($member_id) {
        $profile_base_id = getenv('AIRTABLE_PROFILE_BASE_ID');
        $answers_table_id = getenv('WIZARD_ANSWERS_TABLE_ID');
        $client_level_records = vision_airtable_paginated_request($profile_base_id, $answers_table_id, [
            'filterByFormula' => "{clientid} = \"{$member_id}\""
        ]);
        if (!is_wp_error($client_level_records)) {
            $client_levels = $client_level_records;
        }
    }
    
    // 5. Consolidate and Send Final Response
    $is_customizable_flag = !empty($field_definitions);

    wp_send_json_success([
        'workoutData'       => $workout_data,
        'fieldDefinitions'  => $field_definitions,
        'clientLevels'      => $client_levels,
		  'isCustomizable'    => $is_customizable_flag,
    ]);
}

/**
 * AJAX handler to save a record to the workout history table in Airtable.
 * This is triggered when a user clicks the "Finish Workout" button.
 */
function vision_save_workout_history_handler() {
    // 1. Security & Input Validation
    check_ajax_referer('vision_ajax_nonce', 'security');
    if (!is_user_logged_in()) {
        wp_send_json_error(['message' => 'You must be logged in to save your progress.']);
        return;
    }
    if (!isset($_POST['client_id'], $_POST['workout_id'])) {
        wp_send_json_error(['message' => 'Missing required data to save progress.']);
        return;
    }

    // 2. Get Data and Credentials
    $client_id = sanitize_text_field($_POST['client_id']);
    $workout_id = sanitize_text_field($_POST['workout_id']);
    $api_key = getenv('AIRTABLE_API_KEY');
    $base_id = getenv('AIRTABLE_PROFILE_BASE_ID'); 
    $table_id = 'tblBsEWWqDXrXOQPD'; // Workout History Table ID

    if (empty($api_key) || empty($base_id)) {
        wp_send_json_error(['message' => 'Server API is not configured.']);
        return;
    }

    // 3. Prepare and Send POST Request to Airtable
    $airtable_url = "https://api.airtable.com/v0/{$base_id}/{$table_id}";
    $post_body = json_encode([
        'records' => [[
            'fields' => [
                'clientid'  => $client_id,
                'workoutid' => $workout_id
            ]
        ]]
    ]);
    
    $response = wp_remote_post($airtable_url, [
        'headers' => ['Authorization' => 'Bearer ' . $api_key, 'Content-Type' => 'application/json'],
        'body'    => $post_body,
        'timeout' => 20
    ]);

    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        wp_send_json_error(['message' => 'Could not save workout history to the server.']);
        return;
    }

    wp_send_json_success(['message' => 'Workout progress saved successfully.']);
}

// HOOKS FOR NEW VISION CUSTOMIZATION PAGE HANDLERS
// Allow both logged-in and non-logged-in users to view workout data.
add_action('wp_ajax_nopriv_get_custom_workout_data', 'vision_get_custom_workout_data_handler');
add_action('wp_ajax_get_custom_workout_data', 'vision_get_custom_workout_data_handler');

// Only allow logged-in users to save their workout history.
add_action('wp_ajax_save_workout_history', 'vision_save_workout_history_handler');

// ===================================================================
// END: NEW AJAX HANDLERS FOR VISION CUSTOMIZATION PAGE
// ===================================================================
// 
// 
// 
//
 /**
 * NEW AJAX ACTION
 * Handles user login, then immediately checks customization needs to determine the correct redirect.
 * This avoids the security nonce issue by performing all actions in a single, authenticated request.
 */
function vision_login_and_check_customization_handler() {
    // We don't need a nonce for the login itself, but we check for required fields.
    if (!isset($_POST['log'], $_POST['pwd'], $_POST['workout_id'])) {
        wp_send_json_error(['message' => 'Missing required login data.']);
        return;
    }

    // 1. Attempt to log the user in securely
    $creds = [
        'user_login'    => sanitize_user($_POST['log']),
        'user_password' => $_POST['pwd'],
        'remember'      => isset($_POST['rememberme']) && $_POST['rememberme'] === 'forever',
    ];
    $user = wp_signon($creds, false);

    // If wp_signon returns an error, the login failed.
    if (is_wp_error($user)) {
        wp_send_json_error(['message' => 'Invalid username or password.']);
        return;
    }

    // 2. LOGIN SUCCESSFUL: Now, check for customization needs.
    $workout_id = sanitize_text_field($_POST['workout_id']);
    $member_id = $user->ID; // We get the ID directly from the successful login.

    // Get the required customization IDs for the specific workout
    $workout_record = vision_get_airtable_workout_record($workout_id); // Assuming you have a helper like this
    if (is_wp_error($workout_record) || empty($workout_record)) {
        // If workout isn't found, just tell the JS to reload.
        wp_send_json_success(['action' => 'reload']);
        return;
    }
    $required_ids_raw = $workout_record['fields']['memberLevel'] ?? [];
    $required_ids = is_array($required_ids_raw) ? $required_ids_raw : explode(',', $required_ids_raw);
    $required_ids = array_filter(array_unique(array_map('trim', $required_ids)));

    // If the workout isn't customizable, just reload.
    if (empty($required_ids)) {
        wp_send_json_success(['action' => 'reload']);
        return;
    }

    // Get the user's completed customization levels
    $client_levels_records = vision_get_airtable_client_levels($member_id); // Assuming you have a helper like this
    $completed_ids = [];
    if (!is_wp_error($client_levels_records)) {
        foreach ($client_levels_records as $record) {
            if (!empty($record['fields']['levelid'])) {
                $completed_ids[] = $record['fields']['levelid'];
            }
        }
    }

    // Find the difference
    $incomplete_ids = array_diff($required_ids, array_unique($completed_ids));

    // 3. DECIDE THE REDIRECT
    if (!empty($incomplete_ids)) {
        // User is missing levels, build the customization URL
        $return_slug = isset($_POST['return_slug']) ? sanitize_text_field($_POST['return_slug']) : 'workout-library';
        $ids_query_string = implode(',', $incomplete_ids);
        $final_url = "https://courses.coachbachmann.com/workout-customization/?ids={$ids_query_string}&next={$workout_id}&return={$return_slug}";

        wp_send_json_success([
            'action' => 'redirect',
            'url'    => $final_url,
        ]);
    } else {
        // User has all required levels, just tell the JS to reload the current page.
        wp_send_json_success(['action' => 'reload']);
    }
}

// Helper function to get a single workout record (you may already have similar logic)
function vision_get_airtable_workout_record($workout_id) {
    $workout_base_id = getenv('WORKOUT_DATA_BASE_ID');
    $workout_table_name = 'Workout Library';
    $records = vision_airtable_paginated_request($workout_base_id, $workout_table_name, [
        'filterByFormula' => "{id} = \"{$workout_id}\""
    ]);
    return (is_wp_error($records) || empty($records)) ? null : $records[0];
}

// Helper function to get a user's levels (you may already have similar logic)
function vision_get_airtable_client_levels($member_id) {
    $profile_base_id = getenv('AIRTABLE_PROFILE_BASE_ID');
    $answers_table_id = getenv('WIZARD_ANSWERS_TABLE_ID');
    return vision_airtable_paginated_request($profile_base_id, $answers_table_id, [
        'filterByFormula' => "{clientid} = \"{$member_id}\""
    ]);
}


// Add the new AJAX action hooks (for both logged-out and logged-in users)
add_action('wp_ajax_nopriv_vision_login_and_check_customization', 'vision_login_and_check_customization_handler');
add_action('wp_ajax_vision_login_and_check_customization', 'vision_login_and_check_customization_handler');



// ===================================================================
// DELETE ADDITIONAL CSS FROM PAGE
// ===================================================================

/**

 */

add_action( 'wp_head', 'disable_additional_css_for_specific_page' );
function disable_additional_css_for_specific_page() {
    // This will disable the "Additional CSS" on your specific page with ID 72720.
    if ( is_page( 72720 ) ) {
        remove_action( 'wp_head', 'wp_custom_css_cb', 101 );
    }
}



// ===================================================================
// START: FINAL AJAX HANDLERS FOR KNOWLEDGE BASE ARTICLE PAGE
// ===================================================================

/**
 * HELPER FUNCTION: Fetches records from Airtable, handling pagination.
 */
function vision_kb_paginated_request($base_id, $table_id, $options = [])
{
    $api_key = getenv('AIRTABLE_API_KEY');
    if (empty($api_key) || empty($base_id) || empty($table_id)) {
        return new WP_Error('api_config_error', 'Airtable API is not configured on the server.');
    }

    $all_records = [];
    $offset      = null;
    $url         = "https://api.airtable.com/v0/{$base_id}/{$table_id}";
    $query_params = [];

    if (!empty($options['filterByFormula'])) {
        $query_params['filterByFormula'] = $options['filterByFormula'];
    }
    if (!empty($options['fields']) && is_array($options['fields'])) {
        $query_params['fields'] = $options['fields'];
    }

    do {
        $request_args = [
            'headers' => ['Authorization' => 'Bearer ' . $api_key],
            'timeout' => 20,
        ];

        $request_url = add_query_arg($query_params, $url);

        if ($offset) {
            $request_url = add_query_arg('offset', $offset, $request_url);
        }

        $response = wp_remote_get($request_url, $request_args);

        if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
            return new WP_Error('api_fetch_error', 'Failed to fetch data from Airtable.', ['response' => $response]);
        }

        $body = json_decode(wp_remote_retrieve_body($response), true);
        if (isset($body['records'])) {
            $all_records = array_merge($all_records, $body['records']);
        }
        $offset = $body['offset'] ?? null;

    } while ($offset);

    return $all_records;
}

function vision_combine_explanations($fields)
{
    $explanations = [
        $fields['Explination 1'] ?? '',
        $fields['Explination 2'] ?? '',
        $fields['Explanation 3'] ?? '',
        $fields['Explanation 4'] ?? ''
    ];
    return implode("\n\n", array_filter($explanations));
}

function vision_transform_athletic_level($level)
{
    $level_map = [
        'A' => 'Beginner',
        'B' => 'Intermediate',
        'C' => 'Advanced',
        'D' => 'Professional'
    ];
    return $level_map[$level] ?? $level;
}

function vision_split_comma_string($text)
{
    if (empty($text) || !is_string($text)) {
        return [];
    }
    return array_map('trim', explode(',', $text));
}

/**
 * MAIN AJAX HANDLER: Fetches all data for the article page securely.
 */
/**
 * MAIN AJAX HANDLER: Fetches all data for the article page securely.
 */
function vision_get_article_page_data_handler() {
    check_ajax_referer('vision_ajax_nonce', 'security');
    if (!isset($_POST['article_slug'])) {
        wp_send_json_error(['message' => 'Error: Article slug is missing.']);
        return;
    }
    $article_slug = sanitize_text_field($_POST['article_slug']);

    // --- Caching Setup ---
    $upload_dir = wp_upload_dir();
    $cache_dir = $upload_dir['basedir'] . '/app-cache';
    if (!is_dir($cache_dir)) { wp_mkdir_p($cache_dir); }
    $cache_file = $cache_dir . '/kb_article_' . $article_slug . '.json';
    $cache_life = 15 * MINUTE_IN_SECONDS;

    // --- Step 1: Get Airtable data (from cache or fresh) ---
    if (file_exists($cache_file) && (time() - filemtime($cache_file)) < $cache_life) {
        $public_data = json_decode(file_get_contents($cache_file), true);
    } else {
        $public_data = [];
        $main_base_id = getenv('KNOWLEDGEBASE_BASE_ID');
        $main_table_id = 'tbl7IKLPFq73rx4Kw'; // Articles table

        // Find the article by slug
        $all_slug_records = vision_kb_paginated_request($main_base_id, $main_table_id, ['fields' => ['Slug']]);
        if (is_wp_error($all_slug_records) || !is_array($all_slug_records)) {
            wp_send_json_error(['message' => 'Error communicating with the article database.']);
            return;
        }

        $found_record_id = null;
        foreach ($all_slug_records as $record) {
            if (isset($record['fields']['Slug']) && strtolower($record['fields']['Slug']) === strtolower($article_slug)) {
                $found_record_id = $record['id'];
                break;
            }
        }

        if (!$found_record_id) {
            wp_send_json_error(['message' => 'Could not find the specified article.']);
            return;
        }

        // Fetch the full article record
        $article_records = vision_kb_paginated_request($main_base_id, $main_table_id, ['filterByFormula' => "RECORD_ID() = '{$found_record_id}'"]);
        if (is_wp_error($article_records) || empty($article_records)) {
            wp_send_json_error(['message' => 'Could not retrieve full article data.']);
            return;
        }
        
        $article_record = $article_records[0];
        $article_fields = $article_record['fields'];
        $public_data['article'] = [
            'recordId' => $article_record['id'],
            'title' => $article_fields['TItle'] ?? 'Untitled',
            'subHeadline' => $article_fields['Sub Headline'] ?? '',
            'heroImage' => $article_fields['hero image'] ?? null,
            'categories' => $article_fields['wordpress cat'] ?? [],
            'audioUrl' => $article_fields['Audio URL'] ?? null,
            'timestampsUrl' => $article_fields['Timestamps JSON'] ?? null,
            'featuredVideo' => $article_fields['Featured Video'] ?? null,
            'script' => $article_fields['Script'] ?? '',
            'mediaMap' => json_decode($article_fields['media map'] ?? '{}', true),
            'exerciseMap' => json_decode($article_fields['Exercise map'] ?? '{}', true)
        ];

        // --- START: FETCHING ALL RELATED CONTENT ---
        $concepts_table_id = 'tbld9yxzEVKYw9WY7';
        $exercises_table_id = 'tblXubtfoRUv0v96R';

        // FETCH CONCEPTS & GATHER THEIR EXERCISE IDs
        preg_match_all('/\[c\](.*?)\[\/c\]/u', $public_data['article']['script'], $concept_matches);
        $concept_names = array_unique($concept_matches[1]);
        $public_data['allConceptsMap'] = [];
        $exercise_ids_from_concepts = [];
        if (!empty($concept_names)) {
            $concept_formula_parts = array_map(function($name) { return "{Concept}='" . addslashes($name) . "'"; }, $concept_names);
            $concept_records = vision_kb_paginated_request($main_base_id, $concepts_table_id, ['filterByFormula' => 'OR(' . implode(',', $concept_formula_parts) . ')']);
            if (is_array($concept_records)) {
                foreach ($concept_records as $record) {
                    $public_data['allConceptsMap'][$record['fields']['Concept']] = $record['fields'];
                    if (!empty($record['fields']['Exercise'])) {
                        $exercise_ids_from_concepts = array_merge($exercise_ids_from_concepts, $record['fields']['Exercise']);
                    }
                }
            }
        }
        
        // FETCH EXERCISES mentioned in script AND linked from concepts
        preg_match_all('/\[e\](.*?)\[\/e\]/u', $public_data['article']['script'], $exercise_matches);
        $script_exercise_names = array_unique($exercise_matches[1]);
        $exercise_map = $public_data['article']['exerciseMap'];
        $mapped_exercise_names = [];
        if(is_array($exercise_map)) {
            foreach ($script_exercise_names as $name) {
                if (isset($exercise_map[$name])) {
                    $mapped_exercise_names[] = $exercise_map[$name];
                }
            }
        }
        
        $all_exercise_records_map = []; // Use a map to auto-handle duplicates

        // Fetch exercises by name (from script)
        if (!empty($mapped_exercise_names)) {
            $exercise_name_formula = 'OR(' . implode(',', array_map(function($name) { return "{Current Name}='" . addslashes($name) . "'"; }, array_unique($mapped_exercise_names))) . ')';
            $records_from_names = vision_kb_paginated_request($main_base_id, $exercises_table_id, ['filterByFormula' => $exercise_name_formula]);
            if(is_array($records_from_names)) {
                foreach ($records_from_names as $record) { $all_exercise_records_map[$record['id']] = $record; }
            }
        }

        // Fetch exercises by ID (from concepts)
        if (!empty($exercise_ids_from_concepts)) {
            $exercise_id_formula = 'OR(' . implode(',', array_map(function($id) { return "RECORD_ID()='{$id}'"; }, array_unique($exercise_ids_from_concepts))) . ')';
            $records_from_ids = vision_kb_paginated_request($main_base_id, $exercises_table_id, ['filterByFormula' => $exercise_id_formula]);
            if(is_array($records_from_ids)) {
                foreach ($records_from_ids as $record) { $all_exercise_records_map[$record['id']] = $record; }
            }
        }
        
        // Process the final, unique list of exercises
        $public_data['exercisesUsed'] = [];
        foreach ($all_exercise_records_map as $record) {
            $fields = $record['fields'];
            $public_data['exercisesUsed'][] = [
                'record id' => $record['id'],
                'name' => $fields['Current Name'] ?? '',
                'vimeoCode' => $fields['Vimeo Code'] ?? null,
                'explanation' => vision_combine_explanations($fields),
                'athleticLevel' => vision_transform_athletic_level($fields['Athletic Level'] ?? ''),
                'equipment' => vision_split_comma_string($fields["Public Name (from Equipment)"] ?? ''),
                'muscles' => [
                    'primaryWorked' => vision_split_comma_string($fields['Primary Muscle Worked'] ?? ''),
                    'secondaryWorked' => vision_split_comma_string($fields['Secondary Muscle Worked'] ?? '')
                ],
                'movements' => [
                    'compound' => vision_split_comma_string($fields['Compound Movements'] ?? ''),
                ]
            ];
        }

        // Fetch Related Workouts
        $related_workout_ids = $article_fields['Related workouts'] ?? [];
        $public_data['relatedWorkouts'] = !empty($related_workout_ids) ? vision_kb_paginated_request($main_base_id, 'tblgy34EQoSmGXlmo', ['filterByFormula' => 'OR(' . implode(',', array_map(function($id) { return "RECORD_ID()='{$id}'"; }, $related_workout_ids)) . ')']) : [];

        // Fetch Related Articles by Category
        $public_data['relatedArticles'] = [];
        $categories_to_match = $article_fields['wordpress cat'] ?? [];
        if (!empty($categories_to_match) && is_array($categories_to_match)) {
            $formula_parts = array_map(function($cat) { return "FIND('" . addslashes($cat) . "', {wordpress cat})"; }, $categories_to_match);
            $article_formula = 'OR(' . implode(',', $formula_parts) . ')';
            $all_matching_articles = vision_kb_paginated_request($main_base_id, $main_table_id, ['filterByFormula' => $article_formula]);
            if (is_array($all_matching_articles)) {
                $public_data['relatedArticles'] = array_values(array_filter($all_matching_articles, function($article) use ($found_record_id) { return $article['id'] !== $found_record_id; }));
            }
        }
        
        // Fetch Polls and their Answers
        $public_data['polls'] = [];
        $poll_question_ids = $article_fields['Poll Questions'] ?? [];
        if(!empty($poll_question_ids)) {
            $poll_records = vision_kb_paginated_request($main_base_id, 'tblslcWL0x40KN6Tz', ['filterByFormula' => 'OR(' . implode(',', array_map(function($id) { return "RECORD_ID()='{$id}'"; }, $poll_question_ids)) . ')']);
            foreach($poll_records as $poll) {
                $answer_ids = $poll['fields']['Poll Question Answers'] ?? [];
                if(empty($answer_ids)) continue;
                $answers = vision_kb_paginated_request($main_base_id, 'tblWJNmg2zMBRmtkW', ['filterByFormula' => 'OR(' . implode(',', array_map(function($id) { return "RECORD_ID()='{$id}'"; }, $answer_ids)) . ')']);
                $public_data['polls'][] = ['record' => $poll, 'answers' => $answers];
            }
        }
        
        // Fetch Final Poll and its Answers
        $public_data['finalPoll'] = [];
        $final_poll_ids = $article_fields['Final Poll Questions'] ?? [];
        if (!empty($final_poll_ids)) {
            $final_poll_formula = 'OR(' . implode(',', array_map(function($id) { return "RECORD_ID()='{$id}'"; }, $final_poll_ids)) . ')';
            $final_poll_records = vision_kb_paginated_request($main_base_id, 'tblGuWGMoDNQlLrCn', ['filterByFormula' => $final_poll_formula]);
        
            if (is_array($final_poll_records)) {
                $all_poll_workout_ids = [];
                foreach($final_poll_records as $poll) {
                    $answer_ids = $poll['fields']['Answers'] ?? [];
                    if(empty($answer_ids)) continue;
        
                    $answers = vision_kb_paginated_request($main_base_id, 'tblWJNmg2zMBRmtkW', ['filterByFormula' => 'OR(' . implode(',', array_map(function($id) { return "RECORD_ID()='{$id}'"; }, $answer_ids)) . ')']);
                    
                    foreach ($answers as $answer) {
                        if (!empty($answer['fields']['Recommended Workouts'])) {
                            $all_poll_workout_ids = array_merge($all_poll_workout_ids, $answer['fields']['Recommended Workouts']);
                        }
                    }
                    $public_data['finalPoll'][] = ['record' => $poll, 'answers' => $answers];
                }
                
                $public_data['pollWorkouts'] = [];
                if (!empty($all_poll_workout_ids)) {
                    $unique_workout_ids = array_unique($all_poll_workout_ids);
                    $workout_formula = 'OR(' . implode(',', array_map(function($id) { return "RECORD_ID()='{$id}'"; }, $unique_workout_ids)) . ')';
                    $public_data['pollWorkouts'] = vision_kb_paginated_request($main_base_id, 'tblgy34EQoSmGXlmo', ['filterByFormula' => $workout_formula]);
                }
            }
        }
        
      

  // --- YouTube Video Logic ---
$public_data['videoData'] = null;
$public_data['debug_logs'] = []; // Initialize log container

array_push($public_data['debug_logs'], "PHP: Starting YouTube video logic...");

$video_url = $public_data['article']['featuredVideo'] ?? null;
if ($video_url) {
    array_push($public_data['debug_logs'], "PHP: Found video URL: " . $video_url);

    // Extract video ID from URL
    parse_str(parse_url($video_url, PHP_URL_QUERY), $query_params);
    $video_id = $query_params['v'] ?? null;
    
    if ($video_id) {
        array_push($public_data['debug_logs'], "PHP: Extracted video ID: " . $video_id);
        $transient_key = 'youtube_meta_' . $video_id;

        if (false === ($cached_video = get_transient($transient_key))) {
            array_push($public_data['debug_logs'], "PHP: Data not found in cache. Fetching from API...");
            $api_key = getenv('YOUTUBE_API_KEY');

            if ($api_key) {
                array_push($public_data['debug_logs'], "PHP: API key found.");
                $api_url = "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id={$video_id}&key={$api_key}";
                array_push($public_data['debug_logs'], "PHP: Calling API URL: " . $api_url);
                
                $response = wp_remote_get($api_url);

                if (is_wp_error($response)) {
                    // Log WordPress-level errors (e.g., cURL error)
                    array_push($public_data['debug_logs'], "PHP ERROR: wp_remote_get failed. Message: " . $response->get_error_message());
                } else {
                    $response_code = wp_remote_retrieve_response_code($response);
                    array_push($public_data['debug_logs'], "PHP: API responded with HTTP status code: " . $response_code);

                    if ($response_code === 200) {
                        $video_data = json_decode(wp_remote_retrieve_body($response), true);
                        if (!empty($video_data['items'])) {
                            array_push($public_data['debug_logs'], "PHP: Success! Found video data in response.");
                            $public_data['videoData'] = $video_data['items'][0];
                            set_transient($transient_key, $video_data['items'][0], 12 * HOUR_IN_SECONDS);
                            array_push($public_data['debug_logs'], "PHP: Saved data to cache. Key: " . $transient_key);
                        } else {
                            // This happens if the API call is successful but returns no video (e.g., invalid ID)
                            array_push($public_data['debug_logs'], "PHP ERROR: API response did not contain 'items'. Full response: " . wp_remote_retrieve_body($response));
                        }
                    } else {
                        // Log API errors from Google (e.g., bad API key, quota exceeded)
                         array_push($public_data['debug_logs'], "PHP ERROR: API returned a non-200 status. Full response: " . wp_remote_retrieve_body($response));
                    }
                }
            } else {
                array_push($public_data['debug_logs'], "PHP ERROR: YOUTUBE_API_KEY environment variable not set.");
            }
        } else {
            array_push($public_data['debug_logs'], "PHP: Success! Found and used data from cache.");
            $public_data['videoData'] = $cached_video;
        }
    } else {
        array_push($public_data['debug_logs'], "PHP: Could not extract video ID from the URL.");
    }
} else {
    array_push($public_data['debug_logs'], "PHP: No 'featuredVideo' URL found.");
}
  file_put_contents($cache_file, json_encode($public_data));
array_push($public_data['debug_logs'], "PHP: YouTube video logic finished.");
    }
    // --- Final Data Assembly ---
    $final_data = $public_data;
    if (is_user_logged_in() && function_exists('mm_member_data')) {
        $client_id = mm_member_data(['name' => 'id']);
        $client_base_id = getenv('AIRTABLE_PROFILE_BASE_ID');
        $final_data['clientData'] = [
            'id' => $client_id,
            'membershipLevel' => mm_member_data(['name' => 'membershipName']),
            'likedMap' => vision_kb_paginated_request($client_base_id, 'tblQuWWaiH7uDE185', ['filterByFormula' => "{clientID} = \"{$client_id}\""]),
            'ratedArticles' => vision_kb_paginated_request($client_base_id, 'tbl7puSM9TdDxQRVB', ['filterByFormula' => "{clientID} = \"{$client_id}\""]),
            'answeredQuestions' => vision_kb_paginated_request($client_base_id, 'tblqCTNrNTasd2GJj', ['filterByFormula' => "{clientid} = \"{$client_id}\""])
        ];
    }

    wp_send_json_success($final_data);
}


/**
 * AJAX handler for liking/unliking items.
 */
function vision_kb_toggle_like_handler()
{
    check_ajax_referer('vision_ajax_nonce', 'security');
    if (!is_user_logged_in() || !isset($_POST['member_id'])) {
        wp_send_json_error(['message' => 'You must be logged in.']);
        return;
    }

    $item_id             = sanitize_text_field($_POST['item_id']);
    $item_type           = sanitize_text_field($_POST['item_type']);
    $record_id_to_delete = sanitize_text_field($_POST['record_id_to_delete']);
    $client_id           = sanitize_text_field($_POST['member_id']);

    $api_key  = getenv('AIRTABLE_API_KEY');
    $base_id  = getenv('AIRTABLE_PROFILE_BASE_ID');
    $table_id = 'tblQuWWaiH7uDE185';

    $airtable_url = "https://api.airtable.com/v0/{$base_id}/{$table_id}";
    $headers = ['Authorization' => 'Bearer ' . $api_key, 'Content-Type' => 'application/json'];

    if (!empty($record_id_to_delete)) {
        $response = wp_remote_request("{$airtable_url}/{$record_id_to_delete}", ['method' => 'DELETE', 'headers' => $headers]);
    } else {
        $fields = ['clientID' => $client_id];
        if ($item_type === 'article') {
            $fields['articleID'] = $item_id;
        } else {
            $fields['workoutID'] = "workout-library" . $item_id;
        }
        $response = wp_remote_post($airtable_url, ['headers' => $headers, 'body' => json_encode(['records' => [['fields' => $fields]]])]);
    }

    if (is_wp_error($response) || !in_array(wp_remote_retrieve_response_code($response), [200, 201])) {
        wp_send_json_error(['message' => 'Server Error: The action could not be completed.']);
        return;
    }

    wp_send_json_success(json_decode(wp_remote_retrieve_body($response), true));
}

/**
 * AJAX handler for saving an article rating.
 */
function vision_kb_save_rating_handler()
{
    check_ajax_referer('vision_ajax_nonce', 'security');
    if (!is_user_logged_in() || !isset($_POST['member_id'])) {
        wp_send_json_error(['message' => 'You must be logged in.']);
        return;
    }

    $article_id         = sanitize_text_field($_POST['article_id']);
    $rating             = intval($_POST['rating']);
    $existing_record_id = sanitize_text_field($_POST['existing_record_id']);
    $client_id          = sanitize_text_field($_POST['member_id']);

    $api_key  = getenv('AIRTABLE_API_KEY');
    $base_id  = getenv('AIRTABLE_PROFILE_BASE_ID');
    $table_id = 'tbl7puSM9TdDxQRVB';

    $airtable_url = "https://api.airtable.com/v0/{$base_id}/{$table_id}";
    $headers = ['Authorization' => 'Bearer ' . $api_key, 'Content-Type' => 'application/json'];
    $fields  = ['rating' => strval($rating)];

    if (!empty($existing_record_id)) {
        $payload = ['records' => [['id' => $existing_record_id, 'fields' => $fields]]];
        $response = wp_remote_request($airtable_url, ['method' => 'PATCH', 'headers' => $headers, 'body' => json_encode($payload)]);
    } else {
        $fields['clientID'] = $client_id;
        $fields['articleID'] = $article_id;
        $payload = ['records' => [['fields' => $fields]]];
        $response = wp_remote_post($airtable_url, ['headers' => $headers, 'body' => json_encode($payload)]);
    }

    if (is_wp_error($response) || !in_array(wp_remote_retrieve_response_code($response), [200, 201])) {
        wp_send_json_error(['message' => 'Server Error: The rating could not be saved.']);
        return;
    }

    wp_send_json_success(json_decode(wp_remote_retrieve_body($response), true));
}

/**
 * AJAX handler for saving a poll answer.
 */
function vision_kb_save_poll_answer_handler()
{
    check_ajax_referer('vision_ajax_nonce', 'security');

    // ✅ FIX: This block is the only change.
    // It now accepts votes from anonymous users instead of returning an error.
    if (isset($_POST['member_id'])) {
        $client_id = sanitize_text_field($_POST['member_id']);
    } else {
        $client_id = 'anonymous';
    }

    $question_id = sanitize_text_field($_POST['question_id']);
    $answer_id   = sanitize_text_field($_POST['answer_id']);

    $api_key  = getenv('AIRTABLE_API_KEY');
    $base_id  = getenv('AIRTABLE_PROFILE_BASE_ID');
    $table_id = 'tblqCTNrNTasd2GJj';

    // The rest of your original, working code is unchanged.
    $payload = ['fields' => ['clientid' => $client_id, 'Question ID' => $question_id, 'Answer ID' => $answer_id]];

    $response = wp_remote_post("https://api.airtable.com/v0/{$base_id}/{$table_id}", [
        'headers' => ['Authorization' => 'Bearer ' . $api_key, 'Content-Type' => 'application/json'],
        'body'    => json_encode(['records' => [$payload]])
    ]);

    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        wp_send_json_error(['message' => 'Server Error: Poll answer could not be saved.']);
        return;
    }

    wp_send_json_success(json_decode(wp_remote_retrieve_body($response), true));
}

// ACTION HOOKS FOR ALL NEW HANDLERS
add_action('wp_ajax_nopriv_get_article_page_data', 'vision_get_article_page_data_handler');
add_action('wp_ajax_get_article_page_data', 'vision_get_article_page_data_handler');
add_action('wp_ajax_kb_toggle_like', 'vision_kb_toggle_like_handler');
add_action('wp_ajax_kb_save_rating', 'vision_kb_save_rating_handler');
add_action('wp_ajax_nopriv_kb_save_poll_answer', 'vision_kb_save_poll_answer_handler');
add_action('wp_ajax_kb_save_poll_answer', 'vision_kb_save_poll_answer_handler');


// ===================================================================
// END: FINAL & COMPLETE CODE FOR KNOWLEDGE BASE ARTICLE PAGE
// ===================================================================
// 
// /**

/**
 * A dedicated AJAX handler to fetch only YouTube video data.
 */
function vision_get_youtube_data_handler() {
    check_ajax_referer('vision_ajax_nonce', 'security');

    // Use trim() to remove any accidental whitespace from the URL
    $video_url = trim($_POST['video_url'] ?? '');
    $response_data = [
        'videoData' => null,
        'debug_logs' => []
    ];

    if (empty($video_url)) {
        $response_data['debug_logs'][] = "PHP ERROR: No video_url was provided.";
        wp_send_json_error($response_data);
        return;
    }

    array_push($response_data['debug_logs'], "PHP: Starting video logic for URL: " . $video_url);

    $video_id = null;

    // --- ROBUST ID PARSING ---
    // First, try to match a standard YouTube "?v=" parameter
    if (preg_match('/[?&]v=([a-zA-Z0-9_-]{11})/', $video_url, $matches)) {
        $video_id = $matches[1];
    }
    // Else, try to match the last part of a path (for your custom URL)
    elseif (preg_match('/\/([a-zA-Z0-9_-]+)$/', $video_url, $matches)) {
        $video_id = $matches[1];
    }

    if ($video_id) {
        array_push($response_data['debug_logs'], "PHP: Successfully extracted video ID: " . $video_id);
        $transient_key = 'youtube_meta_' . $video_id;
        $cached_video = get_transient($transient_key);

        if (false !== $cached_video) {
            array_push($response_data['debug_logs'], "PHP: Success! Data found in transient cache.");
            $response_data['videoData'] = $cached_video;
        } else {
            array_push($response_data['debug_logs'], "PHP: Data not in transient. Fetching from API...");
            $api_key = getenv('YOUTUBE_API_KEY');

            if ($api_key) {
                $api_url = "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id={$video_id}&key={$api_key}";
                $response = wp_remote_get($api_url);

                if (is_wp_error($response)) {
                    array_push($response_data['debug_logs'], "PHP ERROR: wp_remote_get failed. Message: " . $response->get_error_message());
                } else {
                    $response_code = wp_remote_retrieve_response_code($response);
                    if ($response_code === 200) {
                        $video_data_from_api = json_decode(wp_remote_retrieve_body($response), true);
                        if (!empty($video_data_from_api['items'])) {
                            $response_data['videoData'] = $video_data_from_api['items'][0];
                            set_transient($transient_key, $response_data['videoData'], 12 * HOUR_IN_SECONDS);
                            array_push($response_data['debug_logs'], "PHP: Success! Saved to transient cache.");
                        } else {
                            array_push($response_data['debug_logs'], "PHP ERROR: API response did not contain 'items'.");
                        }
                    } else {
                        array_push($response_data['debug_logs'], "PHP ERROR: API returned non-200 status code: " . $response_code);
                    }
                }
            } else {
                array_push($response_data['debug_logs'], "PHP ERROR: YOUTUBE_API_KEY environment variable not set.");
            }
        }
    } else {
        array_push($response_data['debug_logs'], "PHP ERROR: Could not extract video ID from any known URL format.");
    }

    wp_send_json_success($response_data);
}
// Add these action hooks for the new function
add_action('wp_ajax_nopriv_get_youtube_data', 'vision_get_youtube_data_handler');
add_action('wp_ajax_get_youtube_data', 'vision_get_youtube_data_handler');