import React, { useState } from 'react';
import axios from 'axios';

function SearchBar(props) {

    const [searchInput, setSearchInput] = useState('');
    const [results, setResults] = useState([]);

    const handleChange = (e) => {
        e.preventDefault();
        setSearchInput(e.target.value);
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            search()
        }
    }

    const search = () => {
        var checked = document.querySelector('input[name="service"]:checked')
        if (checked && searchInput.length > 0) {
            if (checked.value === 'Spotify') {
                axios.get('https://api.spotify.com/v1/search', {
                    params: {
                        q: searchInput,
                        type: 'track',
                        limit: 10
                    },
                    headers: { Authorization: `Bearer ${props.token}` }
                }).then((response) => {
                    setResults(response.data.tracks.items)
                })
            } else if (checked.value === 'SoundCloud') {
                axios.get('https://api-v2.soundcloud.com/search?q=' + searchInput + '&variant_ids=&facet=model&user_id=180603-220003-340773-823070&client_id=13dlrtjfx7d3OLEsFzbjJztO2G0U38DK&limit=20&offset=0&linked_partitioning=1&app_version=1714468731&app_locale=en', {
                    headers: {
                        Origin: 'https://soundcloud.com',
                        Referer: 'https://soundcloud.com/'
                    }
                }).then((response) => {
                    console.log(response)
                })
            }
        } else {
            setResults([])
        }
    }

    const select = (entry) => {
        setSearchInput('')
        setResults([])
        props.queueSong(entry)
    }

    return (
        <>
            <div>
                <input type='text' placeholder='Search for Tracks' onChange={handleChange} value={searchInput} onKeyDown={handleKeyDown} />
                <button onClick={() => { search() }} > Search </button>
                <input type="radio" name="service" id="spotify" value="Spotify" />
                <label for="spotify">Spotfy </label>
                <input type="radio" name="service" id="soundcloud" value="SoundCloud" />
                <label for="soundcloud">SoundCloud </label>
            </div>
            {results.map((entry, index) => (
                <div key={index}>
                    <div>{entry.artists.map((artist) => (artist.name + ' '))} - {entry.name} </div>
                    <button onClick={() => { select(entry) }} > Select </button>
                </div>
            ))}
        </>
    )
}

export default SearchBar