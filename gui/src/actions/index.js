import { SERVER } from '../config/global'

export const getShelves = (filterString, page, pageSize, sortField, sortOrder) => {
  return {
    type: 'GET_SHELVES',
    payload: async () => {
      const response = await fetch(`${SERVER}/virtuals?${filterString}&sortField=${sortField || ''}&sortOrder=${sortOrder || ''}&page=${page || ''}&pageSize=${pageSize || ''}`)
      const data = await response.json()
      return data
    }
  }
}

export const getBooks = (vid) => {
  return {
    type: 'GET_BOOKS',
    payload: async () => {
      const response = await fetch(`${SERVER}/virtuals/${vid}/books`)
      const data = await response.json()
      return data
    }
  }
}

export const addShelf = (shelf, filterString, page, pageSize, sortField, sortOrder) => {
  return {
    type: 'ADD_SHELF',
    payload: async () => {
      let response = await fetch(`${SERVER}/virtuals`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shelf)
      })
      response = await fetch(`${SERVER}/virtuals?${filterString}&sortField=${sortField || ''}&sortOrder=${sortOrder || ''}&page=${page || ''}&pageSize=${pageSize || ''}`)
      const data = await response.json()
      return data
    }
  }
}

export const addBook = (book, vid) => {
  return {
    type: 'ADD_BOOK',
    payload: async () => {
      let response = await fetch(`${SERVER}/virtuals/${vid}/books`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(book)
      })
      response = await fetch(`${SERVER}/virtuals/${vid}/books`)
      const data = await response.json()
      return data
    }
  }
}



export const saveShelf = (id, shelf, filterString, page, pageSize, sortField, sortOrder) => {
  return {
    type: 'SAVE_SHELF',
    payload: async () => {
      let response = await fetch(`${SERVER}/virtuals/${id}`, {
        method: 'put',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shelf)
      })
      response = await fetch(`${SERVER}/virtuals?${filterString}&sortField=${sortField || ''}&sortOrder=${sortOrder || ''}&page=${page || ''}&pageSize=${pageSize || ''}`)
      const data = await response.json()
      return data
    }
  }
}

export const saveBook = (vid, book, bid) => {
  return {
    type: 'SAVE_SHELF',
    payload: async () => {
      let response = await fetch(`${SERVER}/virtuals/${vid}/books/${bid}`, {
        method: 'put',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(book)
      })
      response = await fetch(`${SERVER}/virtuals/${vid}/books`)
      const data = await response.json()
      return data
    }
  }
}
export const deleteShelf = (id, filterString, page, pageSize, sortField, sortOrder) => {
  return {
    type: 'DELETE_SHELF',
    payload: async () => {
      let response = await fetch(`${SERVER}/virtuals/${id}`, {
        method: 'delete'
      })
      response = await fetch(`${SERVER}/virtuals?${filterString}&sortField=${sortField || ''}&sortOrder=${sortOrder || ''}&page=${page || ''}&pageSize=${pageSize || ''}`)
      const data = await response.json()
      return data
    }
  }
}

export const deleteBook = (vid, bid) => {
  return {
    type: 'DELETE_BOOK',
    payload: async () => {
      let response = await fetch(`${SERVER}/virtuals/${vid}/books/${bid}`, {
        method: 'delete'
      })
      response = await fetch(`${SERVER}/virtuals/${vid}/books`)
      const data = await response.json()
      return data
    }
  }
}

export const importShelf=(filterString, page, pageSize, sortField, sortOrder)=>{

return{
  type: 'IMPORT_SHELF',
  payload:async()=>{
    let response=await fetch(`${SERVER}/`, {
    method: 'post'
    })
    response = await fetch(`${SERVER}/virtuals?${filterString}&sortField=${sortField || ''}&sortOrder=${sortOrder || ''}&page=${page || ''}&pageSize=${pageSize || ''}`)
    const data = await response.json()
    return data
  }
}

}
