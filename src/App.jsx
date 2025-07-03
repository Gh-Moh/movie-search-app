import React from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner'
import Card from './components/Card'
import { useEffect, useState } from 'react'
import { useDebounce } from 'react-use'
import { updateSearchCount, getTrendingMovies } from './appwrite.js'

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [isloading, setIsLoading] = useState(false);
  const [isTrendloading, setIsTrendLoading] = useState(false);
  const [trendErrMsg, setTrendErrMsg] = useState('');
  const [moviesList, setMoviesList] = useState([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [trendingMovies, setTrendingMovies] = useState([])

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 800, [searchTerm])

  const API_BASE_URL = 'https://api.themoviedb.org/3/'
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const API_OPTIONS = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${API_KEY}`
    }
  }
  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrMsg('');

    try {
      const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&sort_by=popularity.desc` : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`
      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error('failed to fetch movies');
      }

      const data = await response.json();
      if (data.response == 'false') {
        setErrMsg(data.Error || 'Failed To fetch movies');
        setMoviesList([]);
        return;
      }
      setMoviesList(data.results || []);
      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0])
      }
    } catch (err) {
      console.log(`Error fetching movies${err}`);
      setErrMsg('Error fetching movies. Please try again later.')
    } finally {
      setIsLoading(false);
    }
  }
  const loadTrendingMovies = async () => {
    setIsTrendLoading(true)
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error('error fetchong trending movies',error)
      setTrendErrMsg('Failed To Load Trending movies')
    } finally{setIsTrendLoading(false)}
  }
  useEffect(() => {
    fetchMovies(debouncedSearchTerm)
  }, [debouncedSearchTerm]);
  useEffect(() => { loadTrendingMovies() }, []);
  return (
    <main>
      <div className="pattern">
        <div className="wrapper">
          <header>
            <img src="hero.png" alt="hero" />
            <h1> Find <span className='text-gradient'>Movies</span>You'll Love Without the Hassle</h1>
            <Search Term={searchTerm} setTerm={setSearchTerm} />
          </header>

          {!searchTerm ? (
            <section className='trending'>
              <h2>Trending Movies</h2>
              {
              isTrendloading ? (<Spinner/>):
              trendErrMsg ? (<p className='text-red-500'>{trendErrMsg}</p>):
              (<ul>
                  {trendingMovies.map((movie, index) => 
                  <li key={movie.$id} >
                    <p>{index + 1}</p>
                    <img src={movie.posterUrl} alt={movie.title} />
                  </li>)}
                </ul>)
              }
            </section>
          ) : (
            <div className="trending" style={{ minHeight: '0', visibility: 'hidden' }}>
              {/* Invisible placeholder to maintain layout */}
            </div>
          )}

          <section className='all-movies'>
            <h2>{searchTerm ? 'Search Results': 'All Movies'}</h2>
            {isloading ? (
              <Spinner />
            ) : errMsg ? (
              <p className='text-red-500'>{errMsg}</p>
            ) : (<ul>
              {moviesList.map((movie) => (
                <Card key={movie.id} movie={movie} />
              ))}
            </ul>)}
          </section>


        </div>
      </div>
    </main>
  )
}

export default App
