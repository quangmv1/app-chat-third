import React, {Component} from 'react';
import {
  TouchableHighlight,
  ImageBackground,
  PanResponder,
  StyleSheet,
  Animated,
  SafeAreaView,
  Easing,
  Image,
  View,
  Text,
} from 'react-native';
import padStart from 'lodash/padStart';
import {ImagesAssets} from '../../assets/ImagesAssets';
import {Video} from '../../utils';
import {IcFillPlay, PSIcPause24} from '../../icons';

export class PSVideoPlayer extends Component<{uri: string}> {
  static defaultProps = {
    toggleResizeModeOnFullscreen: true,
    controlAnimationTiming: 500,
    doubleTapTime: 130,
    playInBackground: false,
    playWhenInactive: false,
    resizeMode: 'contain',
    isFullscreen: false,
    showOnStart: true,
    paused: true,
    repeat: false,
    muted: false,
    volume: 1,
    title: '',
    rate: 1,
    showTimeRemaining: true,
    showHours: false,
  };

  // @ts-ignore
  constructor(props) {
    super(props);

    /**
     * All of our values that are updated by the
     * methods and listeners in this class
     */
    this.state = {
      // Video
      // @ts-ignore
      resizeMode: this.props.resizeMode,
      // @ts-ignore
      paused: this.props.paused,
      // @ts-ignore
      muted: this.props.muted,
      // @ts-ignore
      volume: this.props.volume,
      // @ts-ignore
      rate: this.props.rate,
      // Controls

      isFullscreen:
        // @ts-ignore
        this.props.isFullScreen || this.props.resizeMode === 'cover' || false,
      // @ts-ignore
      showTimeRemaining: this.props.showTimeRemaining,
      // @ts-ignore
      showHours: this.props.showHours,
      volumeTrackWidth: 0,
      volumeFillWidth: 0,
      seekerFillWidth: 0,
      // @ts-ignore
      showControls: this.props.showOnStart,
      volumePosition: 0,
      seekerPosition: 0,
      volumeOffset: 0,
      seekerOffset: 0,
      seeking: false,
      originallyPaused: false,
      scrubbing: false,
      loading: false,
      currentTime: 0,
      error: false,
      duration: 0,
    };

    /**
     * Any options that can be set at init.
     */
    // @ts-ignore
    this.opts = {
      // @ts-ignore
      playWhenInactive: this.props.playWhenInactive,
      // @ts-ignore
      playInBackground: this.props.playInBackground,
      // @ts-ignore
      repeat: this.props.repeat,
      // @ts-ignore
      title: this.props.title,
    };

    /**
     * Our app listeners and associated methods
     */
    // @ts-ignore
    this.events = {
      // @ts-ignore
      onError: this.props.onError || this._onError.bind(this),
      // @ts-ignore
      onBack: this.props.onBack || this._onBack.bind(this),
      // @ts-ignore
      onEnd: this.props.onEnd || this._onEnd.bind(this),
      // @ts-ignore
      onScreenTouch: this._onScreenTouch.bind(this),
      // @ts-ignore
      onEnterFullscreen: this.props.onEnterFullscreen,
      // @ts-ignore
      onExitFullscreen: this.props.onExitFullscreen,
      // @ts-ignore
      onShowControls: this.props.onShowControls,
      // @ts-ignore
      onHideControls: this.props.onHideControls,
      // @ts-ignore
      onLoadStart: this._onLoadStart.bind(this),
      // @ts-ignore
      onProgress: this._onProgress.bind(this),
      // @ts-ignore
      onSeek: this._onSeek.bind(this),
      // @ts-ignore
      onLoad: this._onLoad.bind(this),
      // @ts-ignore
      onPause: this.props.onPause,
      // @ts-ignore
      onPlay: this.props.onPlay,
    };

    /**
     * Functions used throughout the application
     */
    // @ts-ignore
    this.methods = {
      toggleFullscreen: this._toggleFullscreen.bind(this),
      togglePlayPause: this._togglePlayPause.bind(this),
      toggleControls: this._toggleControls.bind(this),
      toggleTimer: this._toggleTimer.bind(this),
    };

    /**
     * Player information
     */
    // @ts-ignore
    this.player = {
      // @ts-ignore
      controlTimeoutDelay: this.props.controlTimeout || 15000,
      volumePanResponder: PanResponder,
      seekPanResponder: PanResponder,
      controlTimeout: null,
      tapActionTimeout: null,
      volumeWidth: 150,
      iconOffset: 0,
      seekerWidth: 0,
      ref: Video,
      // @ts-ignore
      scrubbingTimeStep: this.props.scrubbing || 0,
      // @ts-ignore
      tapAnywhereToPause: this.props.tapAnywhereToPause,
    };

    /**
     * Various animations
     */
    // @ts-ignore
    const initialValue = this.props.showOnStart ? 1 : 0;

    // @ts-ignore
    this.animations = {
      bottomControl: {
        marginBottom: new Animated.Value(0),
        opacity: new Animated.Value(initialValue),
      },
      topControl: {
        marginTop: new Animated.Value(0),
        opacity: new Animated.Value(initialValue),
      },
      video: {
        opacity: new Animated.Value(1),
      },
      loader: {
        rotate: new Animated.Value(0),
        MAX_VALUE: 360,
      },
    };

    /**
     * Various styles that be added...
     */
    // @ts-ignore
    this.styles = {
      // @ts-ignore
      videoStyle: this.props.videoStyle || {},
      // @ts-ignore
      containerStyle: this.props.style || {},
    };
  }

  // @ts-ignore
  componentDidUpdate = prevProps => {
    // @ts-ignore
    const {isFullscreen} = this.props;

    if (prevProps.isFullscreen !== isFullscreen) {
      this.setState({
        isFullscreen,
      });
    }
  };
  /**
    | -------------------------------------------------------
    | Events
    | -------------------------------------------------------
    |
    | These are the events that the <Video> component uses
    | and can be overridden by assigning it as a prop.
    | It is suggested that you override onEnd.
    |
    */

  /**
   * When load starts we display a loading icon
   * and show the controls.
   */
  _onLoadStart() {
    let state = this.state;
    // @ts-ignore
    state.loading = true;
    this.loadAnimation();
    this.setState(state);

    // @ts-ignore
    if (typeof this.props.onLoadStart === 'function') {
      // @ts-ignore
      this.props.onLoadStart(...arguments);
    }
  }

  /**
   * When load is finished we hide the load icon
   * and hide the controls. We also set the
   * video duration.
   *
   * @param {object} data The video meta data
   */
  _onLoad(data = {}) {
    let state = this.state;
    // @ts-ignore
    state.duration = data.duration;
    // @ts-ignore
    state.loading = false;
    this.setState(state);
    // @ts-ignore
    if (state.showControls) {
      this.setControlTimeout();
    }

    // @ts-ignore
    if (typeof this.props.onLoad === 'function') {
      // @ts-ignore
      this.props.onLoad(...arguments);
    }
  }

  /**
   * For onprogress we fire listeners that
   * update our seekbar and timer.
   *
   * @param {object} data The video meta data
   */
  _onProgress(data = {}) {
    let state = this.state;
    // @ts-ignore
    if (!state.scrubbing) {
      // @ts-ignore
      state.currentTime = data.currentTime;
      // @ts-ignore
      if (!state.seeking) {
        const position = this.calculateSeekerPosition();
        this.setSeekerPosition(position);
      }
      // @ts-ignore
      if (typeof this.props.onProgress === 'function') {
        // @ts-ignore
        this.props.onProgress(...arguments);
      }

      this.setState(state);
    }
  }

  /**
   * For onSeek we clear scrubbing if set.
   *
   * @param {object} data The video meta data
   */
  _onSeek(data = {}) {
    let state = this.state;
    // @ts-ignore
    if (state.scrubbing) {
      // @ts-ignore
      state.scrubbing = false;
      // @ts-ignore
      state.currentTime = data.currentTime;

      // Seeking may be false here if the user released the seek bar while the player was still processing
      // the last seek command. In this case, perform the steps that have been postponed.
      // @ts-ignore
      if (!state.seeking) {
        // @ts-ignore
        this.setControlTimeout();
        // @ts-ignore
        state.paused = state.originallyPaused;
      }

      this.setState(state);
    }
  }

  /**
   * It is suggested that you override this
   * command so your app knows what to do.
   * Either close the video or go to a
   * new page.
   */
  _onEnd() {}

  /**
   * Set the error state to true which then
   * changes our renderError function
   *
   * @param {object} err  Err obj returned from <Video> component
   */
  _onError(err) {
    let state = this.state;
    // @ts-ignore
    state.error = true;
    // @ts-ignore
    state.loading = false;

    this.setState(state);
  }

  /**
   * This is a single and double tap listener
   * when the user taps the screen anywhere.
   * One tap toggles controls and/or toggles pause,
   * two toggles fullscreen mode.
   */
  _onScreenTouch() {
    // @ts-ignore
    if (this.player.tapActionTimeout) {
      // @ts-ignore
      clearTimeout(this.player.tapActionTimeout);
      // @ts-ignore
      this.player.tapActionTimeout = 0;
      // @ts-ignore
      this.methods.toggleFullscreen();
      // @ts-ignore
      const state = this.state;
      // @ts-ignore
      if (state.showControls) {
        this.resetControlTimeout();
      }
    } else {
      // @ts-ignore
      this.player.tapActionTimeout = setTimeout(() => {
        const state = this.state;
        // @ts-ignore
        if (this.player.tapAnywhereToPause && state.showControls) {
          // @ts-ignore
          this.methods.togglePlayPause();
          this.resetControlTimeout();
        } else {
          // @ts-ignore
          this.methods.toggleControls();
        }
        // @ts-ignore
        this.player.tapActionTimeout = 0;
        // @ts-ignore
      }, this.props.doubleTapTime);
    }
  }

  /**
    | -------------------------------------------------------
    | Methods
    | -------------------------------------------------------
    |
    | These are all of our functions that interact with
    | various parts of the class. Anything from
    | calculating time remaining in a video
    | to handling control operations.
    |
    */

  /**
   * Set a timeout when the controls are shown
   * that hides them after a length of time.
   * Default is 15s
   */
  setControlTimeout() {
    // this.player.controlTimeout = setTimeout(() => {
    //   this._hideControls();
    // }, this.player.controlTimeoutDelay);
  }

  /**
   * Clear the hide controls timeout.
   */
  clearControlTimeout() {
    // @ts-ignore
    clearTimeout(this.player.controlTimeout);
  }

  /**
   * Reset the timer completely
   */
  resetControlTimeout() {
    this.clearControlTimeout();
    this.setControlTimeout();
  }

  /**
   * Animation to hide controls. We fade the
   * display to 0 then move them off the
   * screen so they're not interactable
   */
  hideControlAnimation() {
    Animated.parallel([
      // @ts-ignore
      Animated.timing(this.animations.topControl.opacity, {
        toValue: 0,
        // @ts-ignore
        duration: this.props.controlAnimationTiming,
        useNativeDriver: false,
      }),
      // @ts-ignore
      Animated.timing(this.animations.topControl.marginTop, {
        toValue: -100,
        // @ts-ignore
        duration: this.props.controlAnimationTiming,
        useNativeDriver: false,
      }),
      // @ts-ignore
      Animated.timing(this.animations.bottomControl.opacity, {
        toValue: 0,
        // @ts-ignore
        duration: this.props.controlAnimationTiming,
        useNativeDriver: false,
      }),
      // @ts-ignore
      Animated.timing(this.animations.bottomControl.marginBottom, {
        toValue: -100,
        // @ts-ignore
        duration: this.props.controlAnimationTiming,
        useNativeDriver: false,
      }),
    ]).start();
  }

  /**
   * Animation to show controls...opposite of
   * above...move onto the screen and then
   * fade in.
   */
  showControlAnimation() {
    Animated.parallel([
      // @ts-ignore
      Animated.timing(this.animations.topControl.opacity, {
        toValue: 1,
        useNativeDriver: false,
        // @ts-ignore
        duration: this.props.controlAnimationTiming,
      }),
      // @ts-ignore
      Animated.timing(this.animations.topControl.marginTop, {
        toValue: 0,
        useNativeDriver: false,
        // @ts-ignore
        duration: this.props.controlAnimationTiming,
      }),
      // @ts-ignore
      Animated.timing(this.animations.bottomControl.opacity, {
        toValue: 1,
        useNativeDriver: false,
        // @ts-ignore
        duration: this.props.controlAnimationTiming,
      }),
      // @ts-ignore
      Animated.timing(this.animations.bottomControl.marginBottom, {
        toValue: 0,
        useNativeDriver: false,
        // @ts-ignore
        duration: this.props.controlAnimationTiming,
      }),
    ]).start();
  }

  /**
   * Loop animation to spin loader icon. If not loading then stop loop.
   */
  loadAnimation() {
    // @ts-ignore
    if (this.state.loading) {
      Animated.sequence([
        // @ts-ignore
        Animated.timing(this.animations.loader.rotate, {
          // @ts-ignore
          toValue: this.animations.loader.MAX_VALUE,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        // @ts-ignore
        Animated.timing(this.animations.loader.rotate, {
          toValue: 0,
          duration: 0,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ]).start(this.loadAnimation.bind(this));
    }
  }

  /**
   * Function to hide the controls. Sets our
   * state then calls the animation.
   */
  _hideControls() {
    // @ts-ignore
    if (this.mounted) {
      let state = this.state;
      // @ts-ignore
      state.showControls = false;
      this.hideControlAnimation();
      // @ts-ignore
      typeof this.events.onHideControls === 'function' &&
        // @ts-ignore
        this.events.onHideControls();

      this.setState(state);
    }
  }

  /**
   * Function to toggle controls based on
   * current state.
   */
  _toggleControls() {
    let state = this.state;
    // @ts-ignore
    state.showControls = !state.showControls;

    // @ts-ignore
    if (state.showControls) {
      this.showControlAnimation();
      this.setControlTimeout();
      // @ts-ignore
      typeof this.events.onShowControls === 'function' &&
        // @ts-ignore
        this.events.onShowControls();
    } else {
      this.hideControlAnimation();
      this.clearControlTimeout();
      // @ts-ignore
      typeof this.events.onHideControls === 'function' &&
        // @ts-ignore
        this.events.onHideControls();
    }

    this.setState(state);
  }

  /**
   * Toggle fullscreen changes resizeMode on
   * the <Video> component then updates the
   * isFullscreen state.
   */
  _toggleFullscreen() {
    let state = this.state;

    // @ts-ignore
    state.isFullscreen = !state.isFullscreen;

    // @ts-ignore
    if (this.props.toggleResizeModeOnFullscreen) {
      // @ts-ignore
      state.resizeMode = state.isFullscreen === true ? 'cover' : 'contain';
    }

    // @ts-ignore
    if (state.isFullscreen) {
      // @ts-ignore
      typeof this.events.onEnterFullscreen === 'function' &&
        // @ts-ignore
        this.events.onEnterFullscreen();
    } else {
      // @ts-ignore
      typeof this.events.onExitFullscreen === 'function' &&
        // @ts-ignore
        this.events.onExitFullscreen();
    }

    this.setState(state);
  }

  /**
   * Toggle playing state on <Video> component
   */
  _togglePlayPause() {
    let state = this.state;
    // @ts-ignore
    state.paused = !state.paused;

    // @ts-ignore
    if (state.paused) {
      // @ts-ignore
      typeof this.events.onPause === 'function' && this.events.onPause();
    } else {
      // @ts-ignore
      typeof this.events.onPlay === 'function' && this.events.onPlay();
    }

    this.setState(state);
  }

  /**
   * Toggle between showing time remaining or
   * video duration in the timer control
   */
  _toggleTimer() {
    let state = this.state;
    // @ts-ignore
    state.showTimeRemaining = !state.showTimeRemaining;
    this.setState(state);
  }

  /**
   * The default 'onBack' function pops the navigator
   * and as such the video player requires a
   * navigator prop by default.
   */
  _onBack() {
    // @ts-ignore
    if (this.props.navigator && this.props.navigator.pop) {
      // @ts-ignore
      this.props.navigator.pop();
    } else {
      console.warn(
        'Warning: _onBack requires navigator property to function. Either modify the onBack prop or pass a navigator prop',
      );
    }
  }

  /**
   * Calculate the time to show in the timer area
   * based on if they want to see time remaining
   * or duration. Formatted to look as 00:00.
   */
  calculateTime() {
    // @ts-ignore
    const time = this.state.duration - this.state.currentTime;
    return `${this.formatTime(time)}`;
    // if (this.state.showTimeRemaining) {
    //   const time = this.state.duration - this.state.currentTime;
    //   return `-${this.formatTime(time)}`;
    // }

    // return this.formatTime(this.state.currentTime);
  }

  /**
   * Format a time string as mm:ss
   *
   * @param {int} time time in milliseconds
   * @return {string} formatted time string in mm:ss format
   */
  formatTime(time = 0) {
    // @ts-ignore
    const symbol = this.state.showRemainingTime ? '-' : '';
    // @ts-ignore
    time = Math.min(Math.max(time, 0), this.state.duration);

    // @ts-ignore
    if (!this.state.showHours) {
      const formattedMinutes = padStart(
        Math.floor(time / 60).toFixed(0),
        2,
        '0',
      );
      const formattedSeconds = padStart(
        Math.floor(time % 60).toFixed(0),
        2,
        '0',
      );

      return `${symbol}${formattedMinutes}:${formattedSeconds}`;
    }

    const formattedHours = padStart(Math.floor(time / 3600).toFixed(0), 2, '0');
    const formattedMinutes = padStart(
      (Math.floor(time / 60) % 60).toFixed(0),
      2,
      '0',
    );
    const formattedSeconds = padStart(Math.floor(time % 60).toFixed(0), 2, '0');

    return `${symbol}${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

  /**
   * Set the position of the seekbar's components
   * (both fill and handle) according to the
   * position supplied.
   *
   * @param {float} position position in px of seeker handle}
   */
  setSeekerPosition(position = 0) {
    let state = this.state;
    position = this.constrainToSeekerMinMax(position);

    // @ts-ignore
    state.seekerFillWidth = position;
    // @ts-ignore
    state.seekerPosition = position;

    // @ts-ignore
    if (!state.seeking) {
      // @ts-ignore
      state.seekerOffset = position;
    }

    this.setState(state);
  }

  /**
   * Constrain the location of the seeker to the
   * min/max value based on how big the
   * seeker is.
   *
   * @param {float} val position of seeker handle in px
   * @return {float} constrained position of seeker handle in px
   */
  constrainToSeekerMinMax(val = 0) {
    if (val <= 0) {
      return 0;
      // @ts-ignore
    } else if (val >= this.player.seekerWidth) {
      // @ts-ignore
      return this.player.seekerWidth;
    }
    return val;
  }

  /**
   * Calculate the position that the seeker should be
   * at along its track.
   *
   * @return {float} position of seeker handle in px based on currentTime
   */
  calculateSeekerPosition() {
    // @ts-ignore
    const percent = this.state.currentTime / this.state.duration;
    // @ts-ignore
    return this.player.seekerWidth * percent;
  }

  /**
   * Return the time that the video should be at
   * based on where the seeker handle is.
   *
   * @return {float} time in ms based on seekerPosition.
   */
  calculateTimeFromSeekerPosition() {
    // @ts-ignore
    const percent = this.state.seekerPosition / this.player.seekerWidth;
    // @ts-ignore
    return this.state.duration * percent;
  }

  /**
   * Seek to a time in the video.
   *
   * @param {float} time time to seek to in ms
   */
  seekTo(time = 0) {
    let state = this.state;
    // @ts-ignore
    state.currentTime = time;
    // @ts-ignore
    this.player.ref.seek(time);
    this.setState(state);
  }

  /**
   * Set the position of the volume slider
   *
   * @param {float} position position of the volume handle in px
   */
  setVolumePosition(position = 0) {
    let state = this.state;
    position = this.constrainToVolumeMinMax(position);
    // @ts-ignore
    state.volumePosition = position + this.player.iconOffset;
    // @ts-ignore
    state.volumeFillWidth = position;

    // @ts-ignore
    state.volumeTrackWidth = this.player.volumeWidth - state.volumeFillWidth;

    // @ts-ignore
    if (state.volumeFillWidth < 0) {
      // @ts-ignore
      state.volumeFillWidth = 0;
    }

    // @ts-ignore
    if (state.volumeTrackWidth > 150) {
      // @ts-ignore
      state.volumeTrackWidth = 150;
    }

    this.setState(state);
  }

  /**
   * Constrain the volume bar to the min/max of
   * its track's width.
   *
   * @param {float} val position of the volume handle in px
   * @return {float} contrained position of the volume handle in px
   */
  constrainToVolumeMinMax(val = 0) {
    if (val <= 0) {
      return 0;
      // @ts-ignore
    } else if (val >= this.player.volumeWidth + 9) {
      // @ts-ignore
      return this.player.volumeWidth + 9;
    }
    return val;
  }

  /**
   * Get the volume based on the position of the
   * volume object.
   *
   * @return {float} volume level based on volume handle position
   */
  calculateVolumeFromVolumePosition() {
    // @ts-ignore
    return this.state.volumePosition / this.player.volumeWidth;
  }

  /**
   * Get the position of the volume handle based
   * on the volume
   *
   * @return {float} volume handle position in px based on volume
   */
  calculateVolumePositionFromVolume() {
    // @ts-ignore
    return this.player.volumeWidth * this.state.volume;
  }

  /**
    | -------------------------------------------------------
    | React Component functions
    | -------------------------------------------------------
    |
    | Here we're initializing our listeners and getting
    | the component ready using the built-in React
    | Component methods
    |
    */

  /**
   * Before mounting, init our seekbar and volume bar
   * pan responders.
   */
  UNSAFE_componentWillMount() {
    this.initSeekPanResponder();
    this.initVolumePanResponder();
  }

  /**
   * To allow basic playback management from the outside
   * we have to handle possible props changes to state changes
   */
  // @ts-ignore
  UNSAFE_componentWillReceiveProps(nextProps) {
    // @ts-ignore
    if (this.state.paused !== nextProps.paused) {
      this.setState({
        paused: nextProps.paused,
      });
    }

    // @ts-ignore
    if (this.styles.videoStyle !== nextProps.videoStyle) {
      // @ts-ignore
      this.styles.videoStyle = nextProps.videoStyle;
    }

    // @ts-ignore
    if (this.styles.containerStyle !== nextProps.style) {
      // @ts-ignore
      this.styles.containerStyle = nextProps.style;
    }
  }

  /**
   * Upon mounting, calculate the position of the volume
   * bar based on the volume property supplied to it.
   */
  componentDidMount() {
    const position = this.calculateVolumePositionFromVolume();
    let state = this.state;
    this.setVolumePosition(position);
    // @ts-ignore
    state.volumeOffset = position;
    // @ts-ignore
    this.mounted = true;

    this.setState(state);
  }

  /**
   * When the component is about to unmount kill the
   * timeout less it fire in the prev/next scene
   */
  componentWillUnmount() {
    // @ts-ignore
    this.mounted = false;
    this.clearControlTimeout();
  }

  /**
   * Get our seekbar responder going
   */
  initSeekPanResponder() {
    // @ts-ignore
    this.player.seekPanResponder = PanResponder.create({
      // Ask to be the responder.
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,

      /**
       * When we start the pan tell the machine that we're
       * seeking. This stops it from updating the seekbar
       * position in the onProgress listener.
       */
      onPanResponderGrant: (evt, gestureState) => {
        let state = this.state;
        this.clearControlTimeout();
        const position = evt.nativeEvent.locationX;
        this.setSeekerPosition(position);
        // @ts-ignore
        state.seeking = true;
        // @ts-ignore
        state.originallyPaused = state.paused;
        // @ts-ignore
        state.scrubbing = false;
        // @ts-ignore
        if (this.player.scrubbingTimeStep > 0) {
          // @ts-ignore
          state.paused = true;
        }
        this.setState(state);
      },

      /**
       * When panning, update the seekbar position, duh.
       */
      onPanResponderMove: (evt, gestureState) => {
        // @ts-ignore
        const position = this.state.seekerOffset + gestureState.dx;
        this.setSeekerPosition(position);
        let state = this.state;

        if (
          // @ts-ignore
          this.player.scrubbingTimeStep > 0 &&
          // @ts-ignore
          !state.loading &&
          // @ts-ignore
          !state.scrubbing
        ) {
          const time = this.calculateTimeFromSeekerPosition();
          // @ts-ignore
          const timeDifference = Math.abs(state.currentTime - time) * 1000;

          if (
            // @ts-ignore
            time < state.duration &&
            // @ts-ignore
            timeDifference >= this.player.scrubbingTimeStep
          ) {
            // @ts-ignore
            state.scrubbing = true;

            this.setState(state);
            setTimeout(() => {
              // @ts-ignore
              this.player.ref.seek(time, this.player.scrubbingTimeStep);
            }, 1);
          }
        }
      },

      /**
       * On release we update the time and seek to it in the video.
       * If you seek to the end of the video we fire the
       * onEnd callback
       */
      onPanResponderRelease: (evt, gestureState) => {
        const time = this.calculateTimeFromSeekerPosition();
        let state = this.state;
        // @ts-ignore
        if (time >= state.duration && !state.loading) {
          // @ts-ignore
          state.paused = true;
          // @ts-ignore
          this.events.onEnd();
          // @ts-ignore
        } else if (state.scrubbing) {
          // @ts-ignore
          state.seeking = false;
        } else {
          this.seekTo(time);
          this.setControlTimeout();
          // @ts-ignore
          state.paused = state.originallyPaused;
          // @ts-ignore
          state.seeking = false;
        }
        this.setState(state);
      },
    });
  }

  /**
   * Initialize the volume pan responder.
   */
  initVolumePanResponder() {
    // @ts-ignore
    this.player.volumePanResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderGrant: (evt, gestureState) => {
        this.clearControlTimeout();
      },

      /**
       * Update the volume as we change the position.
       * If we go to 0 then turn on the mute prop
       * to avoid that weird static-y sound.
       */
      onPanResponderMove: (evt, gestureState) => {
        let state = this.state;
        // @ts-ignore
        const position = this.state.volumeOffset + gestureState.dx;

        this.setVolumePosition(position);
        // @ts-ignore
        state.volume = this.calculateVolumeFromVolumePosition();

        // @ts-ignore
        if (state.volume <= 0) {
          // @ts-ignore
          state.muted = true;
        } else {
          // @ts-ignore
          state.muted = false;
        }

        this.setState(state);
      },

      /**
       * Update the offset...
       */
      onPanResponderRelease: (evt, gestureState) => {
        let state = this.state;
        // @ts-ignore
        state.volumeOffset = state.volumePosition;
        this.setControlTimeout();
        this.setState(state);
      },
    });
  }

  /**
    | -------------------------------------------------------
    | Rendering
    | -------------------------------------------------------
    |
    | This section contains all of our render methods.
    | In addition to the typical React render func
    | we also have all the render methods for
    | the controls.
    |
    */

  /**
   * Standard render control function that handles
   * everything except the sliders. Adds a
   * consistent <TouchableHighlight>
   * wrapper and styling.
   */
  renderControl(children, callback, style = {}) {
    return (
      <TouchableHighlight
        underlayColor="transparent"
        activeOpacity={0.3}
        onPress={() => {
          this.resetControlTimeout();
          callback();
        }}
        style={[styles.controls.control, style]}>
        {children}
      </TouchableHighlight>
    );
  }

  /**
   * Renders an empty control, used to disable a control without breaking the view layout.
   */
  renderNullControl() {
    return <View style={[styles.controls.control]} />;
  }

  /**
   * Groups the top bar controls together in an animated
   * view and spaces them out.
   */
  // renderTopControls() {
  //   // @ts-ignore
  //   const backControl = this.props.disableBack
  //     ? this.renderNullControl()
  //     : this.renderBack();
  //   // @ts-ignore
  //   const volumeControl = this.props.disableVolume
  //     ? this.renderNullControl()
  //     : this.renderVolume();
  //   // @ts-ignore
  //   const fullscreenControl = this.props.disableFullscreen
  //     ? this.renderNullControl()
  //     : this.renderFullscreen();

  //   return (
  //     <Animated.View
  //       style={[
  //         styles.controls.top,
  //         {
  //           // @ts-ignore
  //           opacity: this.animations.topControl.opacity,
  //           // @ts-ignore
  //           marginTop: this.animations.topControl.marginTop,
  //         },
  //       ]}>
  //       <ImageBackground
  //         source={ImagesAssets.topVignette}
  //         style={[styles.controls.column]}
  //         imageStyle={[styles.controls.vignette]}>
  //         <SafeAreaView style={styles.controls.topControlGroup}>
  //           {backControl}
  //           <View style={styles.controls.pullRight}>
  //             {volumeControl}
  //             {fullscreenControl}
  //           </View>
  //         </SafeAreaView>
  //       </ImageBackground>
  //     </Animated.View>
  //   );
  // }

  /**
   * Back button control
   */
  // renderBack() {
  //   return this.renderControl(
  //     <Image
  //       source={ImagesAssets.back}
  //       // @ts-ignore
  //       style={styles.controls.back}
  //     />,
  //     // @ts-ignore
  //     this.events.onBack,
  //     // @ts-ignore
  //     styles.controls.back,
  //   );
  // }

  /**
   * Render the volume slider and attach the pan handlers
   */
  // renderVolume() {
  //   return (
  //     <View style={styles.volume.container}>
  //       <View
  //         // @ts-ignore
  //         style={[styles.volume.fill, {width: this.state.volumeFillWidth}]}
  //       />
  //       <View
  //         // @ts-ignore
  //         style={[styles.volume.track, {width: this.state.volumeTrackWidth}]}
  //       />
  //       <View
  //         // @ts-ignore
  //         style={[styles.volume.handle, {left: this.state.volumePosition}]}
  //         // @ts-ignore
  //         {...this.player.volumePanResponder.panHandlers}>
  //         <Image style={styles.volume.icon} source={ImagesAssets.volume} />
  //       </View>
  //     </View>
  //   );
  // }

  /**
   * Render fullscreen toggle and set icon based on the fullscreen state.
   */
  // renderFullscreen() {
  //   let source =
  //     // @ts-ignore
  //     this.state.isFullscreen === true
  //       ? ImagesAssets.shrink
  //       : ImagesAssets.expand;
  //   return this.renderControl(
  //     <Image source={source} />,
  //     // @ts-ignore
  //     this.methods.toggleFullscreen,
  //     styles.controls.fullscreen,
  //   );
  // }

  /**
   * Render bottom control group and wrap it in a holder
   */
  renderBottomControls() {
    // @ts-ignore
    const timerControl = this.props.disableTimer
      ? this.renderNullControl()
      : this.renderTimer();
    // @ts-ignore
    const seekbarControl = this.props.disableSeekbar
      ? this.renderNullControl()
      : this.renderSeekbar();
    // @ts-ignore
    const playPauseControl = this.props.disablePlayPause
      ? this.renderNullControl()
      : this.renderPlayPause();

    return (
      <Animated.View
        style={[
          // @ts-ignore
          styles.controls.bottom,
          {
            // @ts-ignore
            opacity: this.animations.bottomControl.opacity,
            // @ts-ignore
            marginBottom: this.animations.bottomControl.marginBottom,
          },
        ]}>
        <ImageBackground
          source={ImagesAssets.bottomVignette}
          style={[styles.controls.column]}
          imageStyle={[styles.controls.vignette]}>
          {seekbarControl}
          <SafeAreaView
            style={[styles.controls.row, styles.controls.bottomControlGroup]}>
            {playPauseControl}
            {this.renderTitle()}
            {timerControl}
          </SafeAreaView>
        </ImageBackground>
      </Animated.View>
    );
  }

  /**
   * Render the seekbar and attach its handlers
   */
  renderSeekbar() {
    return (
      <View
        style={styles.seekbar.container}
        collapsable={false}
        // @ts-ignore
        {...this.player.seekPanResponder.panHandlers}>
        <View
          style={styles.seekbar.track}
          onLayout={event =>
            // @ts-ignore
            (this.player.seekerWidth = event.nativeEvent.layout.width)
          }
          pointerEvents={'none'}>
          <View
            style={[
              styles.seekbar.fill,
              {
                // @ts-ignore
                width: this.state.seekerFillWidth,
                // @ts-ignore
                backgroundColor: this.props.seekColor || '#FFF',
              },
            ]}
            pointerEvents={'none'}
          />
        </View>
        <View
          // @ts-ignore
          style={[styles.seekbar.handle, {left: this.state.seekerPosition}]}
          pointerEvents={'none'}>
          <View
            style={[
              styles.seekbar.circle,
              // @ts-ignore
              {backgroundColor: this.props.seekColor || '#FFF'},
            ]}
            pointerEvents={'none'}
          />
        </View>
      </View>
    );
  }

  /**
   * Render the play/pause button and show the respective icon
   */
  renderPlayPause() {
    // let source =
    //   // @ts-ignore
    //   this.state.paused === true ? ImagesAssets.play : ImagesAssets.pause;
    let source =
      // @ts-ignore
      this.state.paused === true ? (
        <IcFillPlay width={22} height={22} fill={'#fff'} />
      ) : (
        <PSIcPause24 width={22} height={22} fill={'#fff'} />
      );

    return this.renderControl(
      source,
      // <Image source={source} />,
      // @ts-ignore
      this.methods.togglePlayPause,
      styles.controls.playPause,
    );
  }

  /**
   * Render our title...if supplied.
   */
  renderTitle() {
    // @ts-ignore
    if (this.opts.title) {
      return (
        <View style={[styles.controls.control, styles.controls.title]}>
          <Text
            style={[styles.controls.text, styles.controls.titleText]}
            numberOfLines={1}>
            {
              // @ts-ignore
              this.opts.title || ''
            }
          </Text>
        </View>
      );
    }

    return null;
  }

  /**
   * Show our timer.
   */
  renderTimer() {
    return this.renderControl(
      <Text style={styles.controls.timerText}>{this.calculateTime()}</Text>,
      // @ts-ignore
      this.methods.toggleTimer,
      styles.controls.timer,
    );
  }

  /**
   * Show loading icon
   */
  renderLoader() {
    // @ts-ignore
    if (this.state.loading) {
      return (
        <View style={styles.loader.container}>
          <Animated.Image
            source={ImagesAssets.loaderIcon}
            style={[
              // @ts-ignore
              styles.loader.icon,
              {
                transform: [
                  {
                    // @ts-ignore
                    rotate: this.animations.loader.rotate.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      );
    }
    return null;
  }

  renderError() {
    // @ts-ignore
    if (this.state.error) {
      return (
        <View style={styles.error.container}>
          <Image source={ImagesAssets.errorIcon} style={styles.error.icon} />
          <Text style={styles.error.text}>Video unavailable</Text>
        </View>
      );
    }
    return null;
  }

  /**
   * Provide all of our options and render the whole component.
   */
  render() {
    return (
      // @ts-ignore
      <View style={[styles.player.container, this.styles.containerStyle]}>
        <Video
          {...this.props}
          // @ts-ignore
          videoRef={videoPlayer => (this.player.ref = videoPlayer)}
          // @ts-ignore
          resizeMode={this.state.resizeMode}
          // @ts-ignore
          volume={this.state.volume}
          // @ts-ignore
          paused={this.state.paused}
          // @ts-ignore
          muted={this.state.muted}
          // @ts-ignore
          rate={this.state.rate}
          // @ts-ignore
          onLoadStart={this.events.onLoadStart}
          // @ts-ignore
          onProgress={this.events.onProgress}
          // @ts-ignore
          onError={this.events.onError}
          // @ts-ignore
          onLoad={this.events.onLoad}
          // @ts-ignore
          onEnd={this.events.onEnd}
          // @ts-ignore
          onSeek={this.events.onSeek}
          // @ts-ignore
          style={[styles.player.video, this.styles.videoStyle]}
          ignoreSilentSwitch="ignore"
          source={{
            // @ts-ignore
            description: 'PS video',
            uri: this.props.uri,
          }}
        />
        {this.renderError()}
        {this.renderLoader()}
        {/* {this.renderTopControls()} */}
        {this.renderBottomControls()}
      </View>
      // <Pressable
      //   onPress={this.events.onScreenTouch}
      //   style={[styles.player.container, this.styles.containerStyle]}>
      // </Pressable>
    );
  }
}

/**
 * This object houses our styles. There's player
 * specific styles and control specific ones.
 * And then there's volume/seeker styles.
 */
const styles = {
  player: StyleSheet.create({
    container: {
      overflow: 'hidden',
      backgroundColor: '#000',
      flex: 1,
      alignSelf: 'stretch',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    video: {
      overflow: 'hidden',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  }),
  error: StyleSheet.create({
    container: {
      backgroundColor: 'rgba( 0, 0, 0, 0.5 )',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    icon: {
      marginBottom: 16,
    },
    text: {
      backgroundColor: 'transparent',
      color: '#f27474',
    },
  }),
  loader: StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
  controls: StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: null,
      width: null,
    },
    column: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: null,
      width: null,
    },
    vignette: {
      resizeMode: 'stretch',
    },
    control: {
      padding: 16,
    },
    text: {
      backgroundColor: 'transparent',
      color: '#FFF',
      fontSize: 14,
      textAlign: 'center',
    },
    pullRight: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    top: {
      flex: 1,
      alignItems: 'stretch',
      justifyContent: 'flex-start',
    },
    bottom: {
      alignItems: 'stretch',
      flex: 2,
      justifyContent: 'flex-end',
    },
    topControlGroup: {
      alignSelf: 'stretch',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      width: null,
      margin: 12,
      marginBottom: 18,
    },
    bottomControlGroup: {
      alignSelf: 'stretch',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginLeft: 12,
      marginRight: 12,
      marginBottom: 0,
    },
    volume: {
      flexDirection: 'row',
    },
    fullscreen: {
      flexDirection: 'row',
    },
    playPause: {
      position: 'relative',
      width: 80,
      zIndex: 0,
    },
    title: {
      alignItems: 'center',
      flex: 0.6,
      flexDirection: 'column',
      padding: 0,
    },
    titleText: {
      textAlign: 'center',
    },
    timer: {
      width: 80,
    },
    timerText: {
      backgroundColor: 'transparent',
      color: '#FFF',
      fontSize: 11,
      textAlign: 'right',
    },
  }),
  volume: StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'flex-start',
      flexDirection: 'row',
      height: 1,
      marginLeft: 20,
      marginRight: 20,
      width: 150,
    },
    track: {
      backgroundColor: '#333',
      height: 1,
      marginLeft: 7,
    },
    fill: {
      backgroundColor: '#FFF',
      height: 1,
    },
    handle: {
      position: 'absolute',
      marginTop: -24,
      marginLeft: -24,
      padding: 16,
    },
    icon: {
      marginLeft: 7,
    },
  }),
  seekbar: StyleSheet.create({
    container: {
      alignSelf: 'stretch',
      height: 28,
      marginLeft: 20,
      marginRight: 20,
    },
    track: {
      backgroundColor: '#333',
      height: 1,
      position: 'relative',
      top: 14,
      width: '100%',
    },
    fill: {
      backgroundColor: '#FFF',
      height: 1,
      width: '100%',
    },
    handle: {
      position: 'absolute',
      marginLeft: -7,
      height: 28,
      width: 28,
    },
    circle: {
      borderRadius: 12,
      position: 'relative',
      top: 8,
      left: 8,
      height: 12,
      width: 12,
    },
  }),
};
