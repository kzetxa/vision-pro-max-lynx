import { makeObservable, observable, action, runInAction, reaction, IReactionDisposer } from "mobx";

export type ThumbnailStatus = "idle" | "loading" | "loaded" | "processing" | "error";

export class VideoThumbnailStore {
	videoId: string | null = null;
	thumbnailUrl: string | null = null;
	status: ThumbnailStatus = "idle";
	errorMessage: string | null = null;

	private fetchController: AbortController | null = null;
	private pollingIntervalId: NodeJS.Timeout | null = null;
	private disposeReaction: IReactionDisposer | null = null;

	constructor() {
		makeObservable(this, {
			videoId: observable,
			thumbnailUrl: observable,
			status: observable,
			errorMessage: observable,
			setVideoId: action,
			fetchThumbnail: action.bound,
			_setStatus: action,
			_setThumbnailUrl: action,
			_setErrorMessage: action,
			_reset: action,
			_startPolling: action,
			_stopPolling: action,
			dispose: action,
		});

		this.disposeReaction = reaction(
			() => this.videoId,
			(newVideoId, oldVideoId) => {
				if (newVideoId && newVideoId !== oldVideoId) {
					this.fetchThumbnail();
				} else if (!newVideoId) {
					this._reset();
				}
			},
			{ fireImmediately: false },
		);
	}

	_setStatus(status: ThumbnailStatus): void {
		const oldStatus = this.status;
		this.status = status;

		if (status === "processing") {
			this._startPolling();
		} else if (oldStatus === "processing" && (status === "loaded" || status === "error" || status === "idle")) {
			this._stopPolling();
		}
	}

	_setThumbnailUrl(url: string | null): void {
		this.thumbnailUrl = url;
	}

	_setErrorMessage(message: string | null): void {
		this.errorMessage = message;
	}

	_reset(): void {
		this._stopPolling();
		if (this.fetchController) {
			this.fetchController.abort();
			this.fetchController = null;
		}
		this.thumbnailUrl = null;
		this.status = "idle";
		this.errorMessage = null;
	}
  
	setVideoId(videoId: string | null): void {
		if (videoId === this.videoId && this.status !== "idle" && this.status !== "error") {
			return;
		}
		this._reset();
		this.videoId = videoId;
		if (!videoId) {
			this._setStatus("error");
			this._setErrorMessage("Video ID is required.");
		}
	}

	_startPolling(): void {
		this._stopPolling();
		if (!this.videoId) {
			console.warn("VideoThumbnailStore: Attempted to start polling without a videoId.");
			return;
		}

		console.log(`VideoThumbnailStore: Starting polling for videoId: ${this.videoId}`);
		this.pollingIntervalId = setInterval(() => {
			if (this.status === "processing" && this.videoId) {
				console.log(`VideoThumbnailStore: Polling attempt for videoId: ${this.videoId}`);
				this.fetchThumbnail();
			} else {
				console.log(`VideoThumbnailStore: Conditions no longer met for polling videoId: ${this.videoId}, stopping.`);
				this._stopPolling();
			}
		}, 3000);
	}

	_stopPolling(): void {
		if (this.pollingIntervalId) {
			clearInterval(this.pollingIntervalId);
			this.pollingIntervalId = null;
			console.log(`VideoThumbnailStore: Stopped polling for videoId: ${this.videoId || "(no video ID)"}`);
		}
	}

	async fetchThumbnail(): Promise<void> {
		if (!this.videoId) {
			this._setStatus("error");
			this._setErrorMessage("Video ID is required.");
			return;
		}

		if (this.fetchController) {
			this.fetchController.abort();
		}
		this.fetchController = new AbortController();
		const signal = this.fetchController.signal;

		this._setStatus("loading");
		this._setErrorMessage(null);
		this._setThumbnailUrl(null);
		const currentVideoId = this.videoId;

		try {
			const vimeoApiUrl = `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${currentVideoId}`;
			const res = await fetch(vimeoApiUrl, { signal });

			if (signal.aborted) return;

			if (res.status === 404) {
				console.warn(`Vimeo oEmbed API returned 404 for video ID ${currentVideoId}. Video might be processing or private.`);
				this._setStatus("processing");
			} else if (res.status === 403) {
				console.warn(`Vimeo oEmbed API returned 403 for video ID ${currentVideoId}. Video is likely private.`);
				this._setStatus("error");
				this._setErrorMessage("Video is private.");
			} else if (!res.ok) {
				console.warn(`Failed to fetch from Vimeo oEmbed API (status: ${res.status}) for video ID ${currentVideoId}.`);
				this._setStatus("error");
				this._setErrorMessage(`Error: ${res.statusText}`);
			} else {
				const contentType = res.headers.get("content-type");
				if (contentType && contentType.includes("application/json")) {
					const data = await res.json();
					if (signal.aborted) return;

					if (data && data.thumbnail_url) {
						this._setThumbnailUrl(data.thumbnail_url);
						this._setStatus("loaded");
					} else {
						console.warn(`Thumbnail URL not found in Vimeo response for ${currentVideoId}.`);
						this._setStatus("processing");
					}
				} else {
					console.warn(`Vimeo oEmbed response was not JSON for ${currentVideoId}. Content-Type: ${contentType}`);
					this._setStatus("processing");
				}
			}
		} catch (fetchError: any) {
			if (fetchError.name === "AbortError") {
				console.log(`Fetch aborted for video ID ${currentVideoId}`);
				return;
			}
			console.error(`Error fetching Vimeo thumbnail for ${currentVideoId}:`, fetchError);
			this._setStatus("error");
			this._setErrorMessage(fetchError.message || "Could not load thumbnail.");
		} finally {
			if (this.fetchController && signal === this.fetchController.signal) {
				this.fetchController = null;
			}
		}
	}

	dispose(): void {
		this._reset();
		if (this.disposeReaction) {
			this.disposeReaction();
			this.disposeReaction = null;
			console.log("VideoThumbnailStore: Reaction disposed.");
		}
	}
} 