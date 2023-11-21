import React, { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Button, Checkbox, Fab, styled, Table, TableCell, TablePagination, TableHead, TableBody, TableRow, TableContainer, Toolbar, Grid, Card } from '@mui/material';
import { Autorenew } from '@mui/icons-material';
import { http, useResize, useFormState } from 'gra-react-utils';
import { tableCellClasses } from '@mui/material/TableCell';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    textAlign: 'center',
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const List = () => {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [state, setState] = useState({ page: 0, rowsPerPage: 50 });

  const [result, setResult] = useState({ size: 0, data: [] });

  const [selected, setSelected] = React.useState([]);

  const isSelected = (code) => selected.indexOf(code) !== -1;

  const networkStatus = useSelector((state) => state.networkStatus);

  const onChangeAllRow = (event) => {
    if (event.target.checked) {
      const newSelected = result.data.map((row) => toID(row));
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const onClickRow = (event, code) => {
    const selectedIndex = selected.indexOf(code);

    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, code);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const emptyRows = result.data && result.data.length;

  const onPageChange = (
    event, page
  ) => {
    setState({ ...state, page: page });
  };

  const onRowsPerPageChange = (
    event
  ) => {
    setState({ ...state, rowsPerPage: event.target.value });
  };

  const onClickRefresh = () => {
    setSelected([]);
    fetchData(state.page);
  }

  const fetchData = async (page) => {
    var data = { data: [] };
    if (networkStatus.connected) {
      const result = await http.get(process.env.REACT_APP_PATH + '/persona/' + page + '/' + state.rowsPerPage);
      data.size = result.size;
      data.totalElements = result.totalElements;
      data.data = data.data.concat(result.content);
    }
    setResult(data);
  };

  const { height, width } = useResize(React);

  useEffect(() => {
    const header = document.querySelector('.MuiToolbar-root');
    const tableContainer = document.querySelector('.MuiTableContainer-root');
    const nav = document.querySelector('nav');
    const toolbarTable = document.querySelector('.Toolbar-table');
    const tablePagination = document.querySelector('.MuiTablePagination-root');

    if (tableContainer) {
      tableContainer.style.width = (width - nav.offsetWidth) + 'px';
      tableContainer.style.height = (height - header.offsetHeight
        - toolbarTable.offsetHeight - tablePagination.offsetHeight) + 'px';
    }
  }, [height, width]);

  useEffect(() => {
    dispatch({ type: 'title', title: 'Gestión de Personas - Almacén de BAH' });
    fetchData(state.page)
  }, [state.page, state.rowsPerPage]);

  const createOnClick = () => {
    navigate('/persona/create');
  };

  const editOnClick = () => {
    navigate('/persona/' + selected[0] + '/edit');
  }

  const deleteOnClick = () => {
    dispatch({
      type: "confirm", msg: 'Esta seguro de eliminar el registro seleccionado?', cb: (e) => {
        if (e) {
          http.delete('/persona/' + selected.join(',')).then((result) => {
            dispatch({ type: 'snack', msg: 'Registro' + (selected.length > 1 ? 's' : '') + ' eliminado!' });
            onClickRefresh();
          });
        }
      }
    });
  };

  const toID = (row) => {
    return row._id && row._id.$oid ? row._id.$oid : row.id;
  }
  return (
    <>
      <Card>
        <Toolbar className="Toolbar-table" direction="row" >
          <Grid container spacing={2}>
            <Grid item xs={12} md={1}>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button sx={{ width: '100%', fontWeight: 'bold' }} disabled={!selected.length} startIcon={<EditIcon />} onClick={editOnClick} variant="contained" color="success">Editar</Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button sx={{ width: '100%', fontWeight: 'bold' }} disabled={!selected.length} startIcon={<DeleteIcon />} onClick={deleteOnClick} variant="contained" color="success">Eliminar</Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button sx={{ width: '100%', fontWeight: 'bold' }} onClick={onClickRefresh} endIcon={<Autorenew />} variant="contained" color="success">Actualizar</Button>
            </Grid>
            <Grid item xs={12} md={1}>
            </Grid>
          </Grid>
        </Toolbar>
        <TableContainer sx={{ maxWidth: '100%', mx: 'auto', maxHeight: '540px' }}>
          <Fab color="success" aria-label="add"
            onClick={createOnClick}
            style={{
              position: 'absolute',
              bottom: 72, right: 24
            }}>
            <AddIcon />
          </Fab>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <StyledTableCell padding="checkbox" className='bg-gore border-table'>
                  <Checkbox
                    style={{ color: 'white' }}
                    indeterminate={selected.length > 0 && selected.length < result.data.length}
                    checked={result && result.data.length > 0 && selected.length === result.data.length}
                    onChange={onChangeAllRow}
                    inputProps={{
                      'aria-label': 'select all desserts',
                    }}
                  />
                </StyledTableCell>
                <StyledTableCell style={{ width: "35%" }} className='bg-gore border-table'>Apellidos y Nombres
                  {/* <TextField {...defaultProps('dependencia')} style={{ padding: 0, marginTop: '5px !important' }} /> */}
                </StyledTableCell>
                <StyledTableCell style={{ width: "10%" }} className='bg-gore border-table'>DNI
                  {/* <TextField {...defaultProps('dependencia')} style={{ padding: 0, marginTop: '5px !important' }} /> */}
                </StyledTableCell>
                <StyledTableCell style={{ width: "35%" }} className='bg-gore border-table'>Dirección
                  {/* <TextField {...defaultProps('dependencia')} style={{ padding: 0, marginTop: '5px !important' }} /> */}
                </StyledTableCell>
                <StyledTableCell style={{ width: "10%" }} className='bg-gore border-table'>Teléfono
                  {/* <TextField {...defaultProps('dependencia')} style={{ padding: 0, marginTop: '5px !important' }} /> */}
                </StyledTableCell>
                <StyledTableCell style={{ width: "10%" }} className='bg-gore border-table'>Estado
                  {/* <TextField {...defaultProps('abreviatura')} style={{ padding: 0, marginTop: '5px !important' }} /> */}
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(result && result.data && result.data.length ? result.data : [])
                .map((row, index) => {
                  const isItemSelected = isSelected(toID(row));
                  return (
                    <StyledTableRow
                      style={{ backgroundColor: (1) ? '' : (index % 2 === 0 ? '#f1f19c' : '#ffffbb') }}
                      hover
                      onClick={(event) => onClickRow(event, toID(row))}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={index + ' ' + toID(row)}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox" className='border-table'>
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                        />
                      </TableCell>
                      <TableCell className='border-table' >
                        {row.apellidoNombre}
                      </TableCell>
                      <TableCell className='border-table' >
                        {row.nroDocumento}
                      </TableCell>
                      <TableCell className='border-table' >
                        {row.direccion}
                      </TableCell>
                      <TableCell className='border-table' >
                        {row.celular}
                      </TableCell>
                      <TableCell align="center">
                        {row.activo === 0 ? (
                          <Chip label="Inactivo" color="error" />
                        ) : row.activo === 1 ? (
                          <Chip label="Activo" color="success" />
                        ) : null}
                      </TableCell>
                    </StyledTableRow >
                  );
                })}
              {(!emptyRows) && (
                <TableRow style={{ height: 53 }}>
                  <TableCell colSpan={7} >
                    No data
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={result.totalElements || 0}
          rowsPerPage={state.rowsPerPage}
          page={state.page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </Card>
    </>
  );

};

export default List;