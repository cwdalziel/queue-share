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
        if (searchInput.length > 0) {
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
            </div>
            {results.map((entry) => (
                <div>
                    <div>{entry.artists.map((artist) => (artist.name + ' '))} - {entry.name} </div>
                    <button onClick={() => { select(entry) }} > Select </button>
                </div>
            ))}
        </>
    )
}

export default SearchBar