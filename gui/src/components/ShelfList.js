import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { FilterMatchMode } from 'primereact/api'


import { getShelves, saveShelf, addShelf, deleteShelf, getBooks, saveBook, addBook, deleteBook} from '../actions'

const bookSelector = state => state.book.bookList
const bookCountSelector = state => state.book.count

const shelfSelector = state => state.shelf.shelfList
const shelfCountSelector = state => state.shelf.count


function ShelfList () {
  const [isDialogShown, setIsDialogShown] = useState(false)
  const[isDialogShownBook, setIsDialogShownBook]=useState(false) 
  const [id, setId] = useState('')
  const [description, setDescription] = useState('')
  const[creationdate, setCreationDate]=useState('')
  const [isNewRecord, setIsNewRecord] = useState(true)
  const [selectedShelf, setSelectedShelf] = useState(null)
  const [filterString, setFilterString] = useState('')

  const[bookid, setBookId]=useState('')
  const [title, setTitle]=useState('')
  const [genre, setGenre]=useState('')
  const [url, setUrl]=useState('')


  const [sortField, setSortField] = useState('')
  const [sortOrder, setSortOrder] = useState(1)

  const [filters, setFilters] = useState({
    id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    description: { value: null, matchMode: FilterMatchMode.CONTAINS }
  })
  const [page, setPage] = useState(0)
  const [first, setFirst] = useState(0)

  const handleFilter = (evt) => {
    const oldFilters = filters
    oldFilters[evt.field] = evt.constraints.constraints[0]
    setFilters({ ...oldFilters })
  }

  const handleFilterClear = (evt) => {
    setFilters({
        id: { value: null, matchMode: FilterMatchMode.CONTAINS },
        description: { value: null, matchMode: FilterMatchMode.CONTAINS }
    })
  }

  useEffect(() => {
    const keys = Object.keys(filters)
    const computedFilterString = keys.map(e => {
      return {
        key: e,
        value: filters[e].value
      }
    }).filter(e => e.value).map(e => `${e.key}=${e.value}`).join('&')
    setFilterString(computedFilterString)
  }, [filters])

  const shelves = useSelector(shelfSelector)
  const count = useSelector(shelfCountSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getShelves(filterString, page, 2, sortField, sortOrder))
  }, [filterString, page, sortField, sortOrder])

 


  const handleAddClick = (evt) => {
    setIsDialogShown(true)
    setIsNewRecord(true)
   setId('')
   setDescription('')
   setCreationDate('')
  }

  const hideDialog = () => {
    setIsDialogShown(false)
  }

  const hideDialogBook=()=>{
      setIsDialogShownBook(false)
  }

  const handleSaveClick = () => {
    if (isNewRecord) {
      dispatch(addShelf({ id, description, creationdate }))
    } else {
      dispatch(saveShelf(selectedShelf, { id, description, creationdate }))
    }
    setIsDialogShown(false)
    setSelectedShelf(null)
    setId('')
    setDescription('')
    setCreationDate('')
  }

  const editShelf = (rowData) => {
    setSelectedShelf(rowData.id)
    setId(rowData.id)
    setDescription(rowData.description)
    setCreationDate(rowData.creationDate)

    setIsDialogShown(true)
    setIsNewRecord(false)
  }

  const handleDeleteShelf = (rowData) => {
    dispatch(deleteShelf(rowData.id))
  }


  const handleDisplayBooks=(rowData)=>{
    dispatch(getBooks(rowData.id))
      setUrl(getBooks(rowData.id).url)
      setTitle(rowData.description)
      setGenre(rowData.genre)
     setIsDialogShownBook(true)
  }
  const handleExport = () => {
    let json = JSON.stringify(shelves);
    let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(json);
    let exportFileDefaultName = 'data.json';

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}
const handleImport = () => {
  const defaultData = require('./shelf.json');
  console.log(defaultData);

  for (let i of defaultData) {
      console.log(i);
      dispatch(addShelf({ "id": i.id, "description": i.description, "creationDate": i.creationDate }))
  }
}
  const tableFooter = (
    <div>
      <Button label='Add' icon='pi pi-plus' onClick={handleAddClick} />
      <Button label='Import' icon='pi pi-plus' onClick={handleImport} />

    </div>
  )

  const dialogFooter = (
    <div>
      <Button label='Save' icon='pi pi-save' onClick={handleSaveClick} />
    </div>
  )

  const opsColumn = (rowData) => {
    return (
      <>
        <Button label='Edit' icon='pi pi-pencil' onClick={() => editShelf(rowData)} />
        <Button label='Delete' icon='pi pi-times' className='p-button p-button-danger' onClick={() => handleDeleteShelf(rowData)} />
         <Button label='View books' icon='pi pi-pencil' onClick={() => handleDisplayBooks(rowData)} /> 
         <Button label='Export shelf' icon='pi pi-pencil' onClick={() => handleExport(rowData)} /> 

      </>
    )
  }

  const handlePageChange = (evt) => {
    setPage(evt.page)
    setFirst(evt.page * 2)
  }

  const handleSort = (evt) => {
    console.warn(evt)
    setSortField(evt.sortField)
    setSortOrder(evt.sortOrder)
  }

  return (
    <div>
    
      <DataTable
        value={shelves}
        footer={tableFooter}
        lazy
        paginator
        onPage={handlePageChange}
        first={first}
        rows={2}
        totalRecords={count}
        onSort={handleSort}
        sortField={sortField}
        sortOrder={sortOrder}
      >
        <Column header='ID' field='id' filter filterField='id' filterPlaceholder='filter by id' onFilterApplyClick={handleFilter} onFilterClear={handleFilterClear} sortable />
        <Column header='Description' field='description' filter filterField='description' filterPlaceholder='filter by description' onFilterApplyClick={handleFilter} onFilterClear={handleFilterClear} sortable />
        <Column header='Creation Date' field='creationdate' sortable />
        <Column body={opsColumn} />
      </DataTable>
      <Dialog header='A shelf' visible={isDialogShown} onHide={hideDialog} footer={dialogFooter}>
        <div>
        <InputText placeholder='ID' onChange={(evt) => setId(evt.target.value)} value={id} />
        </div>
        <div>
          <InputText placeholder='description' onChange={(evt) => setDescription(evt.target.value)} value={description} />
        </div>
        <div>
          <InputText placeholder='creation date' onChange={(evt) => setCreationDate(evt.target.value)} value={creationdate} />
        </div>
      </Dialog>

      <Dialog header='A book' visible={isDialogShownBook} onHide={hideDialogBook}>
        <div>
        BookId={bookid} 
        </div>
        <div>
         Title={title} 
        </div>
        <div>
        Genre= {genre}
        </div>
        URL={url}
        <div>
         {url}
        </div>
      </Dialog>
    </div>
  )
}

export default ShelfList
