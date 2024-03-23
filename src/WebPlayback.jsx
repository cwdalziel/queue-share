import React, { useState, useEffect } from 'react';
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

function WebPlayback(props) {

    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [player, setPlayer] = useState(undefined);
    const [current_track, setTrack] = useState(track);
    const [queue, setQueue] = useState([]);
    const [playlistId, setPlaylistID] = useState('');

    const instance = axios.create({
        headers: { 'Authorization': `Bearer ${props.token}` }
    })

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

            initPlaylist()

            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);

                instance.put('https://api.spotify.com/v1/me/player', {
                    device_ids: [device_id],
                    play: true
                })

            });

            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            player.addListener('player_state_changed', (state => {
                if (state) {
                    player.getCurrentState().then(state => {
                        (!state) ? setActive(false) : setActive(true)
                    });
                    setTrack(state.track_window.current_track);
                    setPaused(state.paused);
                }
            }));

            player.connect();

        };

    }, []);

    const initPlaylist = () => {
        instance.post('https://api.spotify.com/v1/users/3lr11r0n9v3lbpomp9fa44436/playlists', {
            name: 'Queue Share Playlist',
            description: 'Playlist used for streaming through Queue Share',
            public: false
        }).then((response) => {
            setPlaylistID(response.id)
            console.log('Playlist ID', response.id)
        })
    }

    const queueSong = (song) => {
        setQueue([...queue, song])
        console.log(queue)
    }

    if (!is_active || !current_track || playlistId === '') {
        if (playlistId === '') {
            return (
                <div className="container">
                    <div className="main-wrapper">
                        <div>The Queue Share playlist for this instance has not yet been created. Playlist will be created automatically. If playlist is not created automatically, click this button: </div>
                        <button onClick={() => { initPlaylist() }} > Create Playlist </button>
                    </div>
                </div>
            )
        } else {
            return (
                <>
                    <div className="container">
                        <div className="main-wrapper">
                            <b> Instance not active. Playback will transfer automatically. If playback does not transfer automatically, transfer your playback using your Spotify app. </b>
                        </div>
                    </div>
                </>)
        }
    } else {
        return (
            <>
                <div className="container">
                    <div className="main-wrapper">

                        <img src={current_track.album.images[0].url} className="now-playing__cover" alt="" />

                        <div className="now-playing__side">
                            <div className="now-playing__name">{current_track.name}</div>
                            <div className="now-playing__artist">{current_track.artists[0].name}</div>

                            <button className="btn-spotify" onClick={() => { player.previousTrack() }} >
                                &lt;&lt;
                            </button>

                            <button className="btn-spotify" onClick={() => { player.togglePlay() }} >
                                {is_paused ? "PLAY" : "PAUSE"}
                            </button>

                            <button className="btn-spotify" onClick={() => { player.nextTrack() }} >
                                &gt;&gt;
                            </button>

                            <ol>
                                {queue.map((song) => (
                                    <li>{song.artists.map((artist) => (artist.name + ' '))} - {song.name}</li>
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