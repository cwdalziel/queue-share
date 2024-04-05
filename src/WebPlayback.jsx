import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SearchBar from './SearchBar'

const track = {
    name: "",
    album: {
        images: [
            { url: "" }
        ]
    },
    artists: [
        { name: "" }
    ]
}

const sampleSpotState = {
    position: 1
}

function WebPlayback(props) {

    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [player, setPlayer] = useState();
    const [current_track, setTrack] = useState(track);
    const [queue, setQueue] = useState([]);
    const [queueIndex, setQueueIndex] = useState(0);
    const [spotState, setSpotState] = useState(sampleSpotState);
    const prevSpotState = useRef(sampleSpotState)
    const prevQueue = useRef([])

    const instance = axios.create({
        headers: { 'Authorization': `Bearer ${props.token}` }
    })

    const queueSong = (song) => {
        setQueue([...queue, song])
    }

    useEffect(() => {
        if (queue.length === 1) {
            instance.put('https://api.spotify.com/v1/me/player/play', {
                uris: [queue[0].external_urls.spotify],
                position_ms: 1
            })
        }
    }, [queue])

    useEffect(() => {
        if (spotState.position === 0) {
            if ((prevSpotState.current.position !== 0 && queueIndex + 1 < queue.length) ||
                (queue.length > prevQueue.current.length && queueIndex + 1 === prevQueue.current.length)) {
                instance.put('https://api.spotify.com/v1/me/player/play', {
                    uris: [queue[queueIndex + 1].external_urls.spotify],
                    position_ms: 1
                })
                setQueueIndex(queueIndex + 1)
            }
        }
        prevQueue.current = queue
        prevSpotState.current = spotState
    }, [spotState, queueIndex, queue])

    useEffect(() => {

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {

            const player = new window.Spotify.Player({
                name: 'Queue Share',
                getOAuthToken: cb => { cb(props.token); },
                volume: 0.5
            });

            setPlayer(player);

            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);

                instance.put('https://api.spotify.com/v1/me/player', {
                    device_ids: [device_id]
                })

            });

            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            player.addListener('player_state_changed', (() => {
                player.getCurrentState().then(state => {
                    if (state) {
                        setActive(true)
                        setTrack(state.track_window.current_track)
                        setPaused(state.paused)
                        if (state.repeat_mode !== 0) {
                            instance.put('https://api.spotify.com/v1/me/player/repeat?state=off')
                        }
                        if (state.shuffle) {
                            instance.put('https://api.spotify.com/v1/me/player/shuffle?state=false')
                        }
                        setSpotState(state)
                    } else {
                        setActive(false)
                    }
                })
            }));

            player.connect();

        };

    }, []);

    if (!is_active || !current_track) {
        return (
            <>
                <div className="container">
                    <div className="main-wrapper">
                        <b> Instance not active. Playback will transfer automatically. If playback does not transfer automatically, transfer your playback using your Spotify app. </b>
                    </div>
                </div>
            </>)
    } else {
        return (
            <>
                <div className="container">
                    <div className="main-wrapper">

                        <img src={current_track.album.images[0].url} className="now-playing__cover" alt="" />

                        <div className="now-playing__side">
                            <div className="now-playing__name">{current_track.name}</div>
                            <div className="now-playing__artist">{current_track.artists[0].name}</div>

                            <button className="btn-spotify" onClick={() => { player.togglePlay() }} >
                                {is_paused ? "PLAY" : "PAUSE"}
                            </button>

                            <button className="btn-spotify" onClick={() => { player.nextTrack() }} >
                                &gt;&gt;
                            </button>

                            <ol>
                                {queue.map((song, index) => (
                                    <li key={index}>{song.artists.map((artist) => (artist.name + ' '))} - {song.name} {index === queueIndex ? "<--- Now Playing" : ""}</li>
                                ))}
                            </ol>

                            <SearchBar token={props.token} queueSong={queueSong} />

                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default WebPlayback

/* <button className="btn-spotify" onClick={() => { player.previousTrack() }} >
        &lt;&lt;
    </button> */