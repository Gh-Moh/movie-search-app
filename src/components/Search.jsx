import React from 'react'

const Search = ({ Term , setTerm}) => {

  return (
    <div className='search'>
        <div >
            <img src="search.svg" alt="" />
            <input type="text" placeholder='Search through thousands of movies'
            value={Term}
            onChange={(event)=> setTerm(event.target.value)} />
        </div>
    </div>
  )
}

export default Search
