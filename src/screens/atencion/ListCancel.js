import React, { useState, useEffect, useRef } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import {
  Button, Checkbox, Fab, styled, Table, TableCell, TextField, TablePagination,
  TableHead, TableBody, TableRow, TableContainer, Toolbar, Grid, MenuItem, CardContent, Card
} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { Autorenew, Keyboard, PictureAsPdf } from '@mui/icons-material';
import { http, useResize, useFormState } from 'gra-react-utils';
import { tableCellClasses } from '@mui/material/TableCell';
import { useDispatch, useSelector } from "react-redux";
import { useReactToPrint } from 'react-to-print';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

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

  const [state, setState] = useState({ page: 0, rowsPerPage: 50 });

  const [result, setResult] = useState({ size: 0, data: [] });

  const [selected, setSelected] = React.useState([]);

  const isSelected = (code) => selected.indexOf(code) !== -1;

  const [dependencias, setDependencias] = useState([]);

  const networkStatus = useSelector((state) => state.networkStatus);

  const pad = (num, places) => String(num).padStart(places, '0')

  const componentRef = useRef();

  const [o, { defaultProps, set }] = useFormState(useState, { dependencia: 0 }, {});

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
  };

  const printOnClick = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Ficha de Atenciones Canceladas.',
    onAfterPrint: () => dispatch({ type: "snack", msg: 'Ficha de Atenciónes Canceladas impreso.!' }),
  });

  const fetchData = async (page) => {
    var data = { data: [] };
    if (networkStatus.connected) {
      const result = await http.get(process.env.REACT_APP_PATH + '/atencion/' + page + '/' + state.rowsPerPage + '?'
        + new URLSearchParams(o.dependencia ? o : {}).toString() + '&activo=2');
      if (result) {
        data.size = result.size;
        data.totalElements = result.totalElements;
        data.data = data.data.concat(result.content);
      }
      setResult(data);

    }
  };

  const { height, width } = useResize(React);

  useEffect(() => {
    http.get(process.env.REACT_APP_PATH + '/dependencia').then(resultD => {
      // if (resultD) {
      //   resultD.splice(0, 0, { id: 0, name: "TODOS" });
      //   setDependencias(resultD);
      // }
      if (resultD) setDependencias(resultD)
    });

  }, []);

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
    dispatch({ type: 'title', title: 'Listado de Tickets de Atención Cancelados de Atención al Ciudadano - GORE Áncash' });
    fetchData(state.page)
  }, [state.page, state.rowsPerPage]);

  useEffect(() => {
    // if(o.dependencia)
    onClickRefresh();
    // alert(o.dependencia);
  }, [o.dependencia]);

  function onChangeFecha(v) {
    set(o => ({ ...o, fecha: v }));
    o.fecha = v;

    var fecha = o.fecha.toDate ? o.fecha.toDate() : o.fecha;
    var day = pad(fecha.getDate(), 2);
    var month = pad(fecha.getMonth() + 1, 2);
    var year = fecha.getFullYear();

    o.fecha = year + '-' + month + '-' + day;
    fetchData(state.page);

    console.log(o);

  }

  const toID = (row) => {
    return row._id && row._id.$oid ? row._id.$oid : row.id;
  }
  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Card>
          <CardContent>
            <Toolbar className="Toolbar-table" direction="row" >
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button sx={{ width: '100%', fontWeight: 'bold' }} onClick={onClickRefresh} endIcon={<Autorenew />} variant="contained" color="primary">Actualizar</Button>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button sx={{ width: '100%', fontWeight: 'bold' }} startIcon={<PictureAsPdf />} onClick={printOnClick} variant="contained" color="primary">Imprimir</Button>
                </Grid>
              </Grid>
            </Toolbar>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12} md={9} className='mb-2'>
                <TextField
                  className='select'
                  select
                  margin="normal"
                  required
                  fullWidth
                  id="standard-name"
                  label="Seleccione la Dependencia a realizar la Busqueda: "
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Keyboard />
                      </InputAdornment>
                    ),
                  }}
                  {...defaultProps("dependencia")}
                >
                  {dependencias.map((item, i) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3} md={3} className='mb-2'>
                <DesktopDatePicker
                  label="Ingrese la Fecha."
                  inputFormat="DD/MM/YYYY"
                  value={o.fecha || ''}
                  onChange={onChangeFecha}
                  renderInput={(params) =>
                    <TextField
                      type={'number'}
                      sx={{ fontWeight: 'bold' }}
                      margin="normal"
                      required
                      fullWidth
                      id="standard-name"
                      label="Fecha: "
                      placeholder="Ingrese su Fecha."
                      // onKeyUp={onKeyUp}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Keyboard />
                          </InputAdornment>
                        ),
                      }}
                      {...params}
                    />}
                />
              </Grid>
            </Grid>
            <TableContainer sx={{ maxWidth: '100%', mx: 'auto', maxHeight: '540px' }}>
              <Table stickyHeader aria-label="sticky table" ref={componentRef} className='padding-print'>
                <TableHead>
                  <TableRow>
                    <StyledTableCell padding="checkbox" className='bg-gore border-table text-table'>
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
                    <StyledTableCell style={{ minWidth: 80, maxWidth: 80 }} className='bg-gore border-table text-table'>Nº Expediente
                      {/* <TextField {...defaultProps('dependencia')} style={{ padding: 0, marginTop: '5px !important' }} /> */}
                    </StyledTableCell>
                    <StyledTableCell style={{ minWidth: 80, maxWidth: 80 }} className='bg-gore border-table text-table'>Nº Documento
                      {/* <TextField {...defaultProps('abreviatura')} style={{ padding: 0, marginTop: '5px !important' }} /> */}
                    </StyledTableCell>
                    <StyledTableCell style={{ minWidth: 150, maxWidth: 150 }} className='bg-gore border-table text-table'>Apellidos y Nombres
                      {/* <TextField {...defaultProps('nombaperesponsable')} style={{ padding: 0, marginTop: '5px !important' }} /> */}
                    </StyledTableCell>
                    <StyledTableCell style={{ minWidth: 100, maxWidth: 100 }} className='bg-gore border-table text-table'>Razon Social
                      {/* <TextField {...defaultProps('cargoresponsable')} style={{ padding: 0, marginTop: '5px !important' }} /> */}
                    </StyledTableCell>
                    <StyledTableCell style={{ minWidth: 80, maxWidth: 80 }} className='bg-gore border-table text-table'>Nº Celular
                      {/* <TextField {...defaultProps('dependencia')} style={{ padding: 0, marginTop: '5px !important' }} /> */}
                    </StyledTableCell>
                    <StyledTableCell style={{ minWidth: 150, maxWidth: 150 }} className='bg-gore border-table text-table'>Dependencia
                    </StyledTableCell>
                    <StyledTableCell style={{ minWidth: 100, maxWidth: 100 }} className='bg-gore border-table text-table'>Fecha
                      {/* <TextField {...defaultProps('cargoresponsable')} style={{ padding: 0, marginTop: '5px !important' }} /> */}
                    </StyledTableCell>
                    <StyledTableCell style={{ minWidth: 100, maxWidth: 100 }} className='bg-gore border-table text-table'>Hora Cancelada
                      {/* <TextField {...defaultProps('cargoresponsable')} style={{ padding: 0, marginTop: '5px !important' }} /> */}
                    </StyledTableCell>
                    <StyledTableCell style={{ minWidth: 100, maxWidth: 100 }} className='bg-gore border-table text-table'>Motivo de Cancelación
                      {/* <TextField {...defaultProps('cargoresponsable')} style={{ padding: 0, marginTop: '5px !important' }} /> */}
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(result && result.data && result.data.length ? result.data : []).
                    map((row, index) => {
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
                          <TableCell padding="checkbox" className='border-table text-table'>
                            <Checkbox
                              color="primary"
                              checked={isItemSelected}
                            />
                          </TableCell>
                          <TableCell style={{ minWidth: 80, maxWidth: 80 }} className='border-table text-table' align="center">
                            {row.nroExpediente}
                          </TableCell>
                          <TableCell style={{ minWidth: 80, maxWidth: 80 }} className='border-table text-table' align="center">
                            {row.persona.nroDocumento}
                          </TableCell>
                          <TableCell style={{ minWidth: 150, maxWidth: 150 }} className='border-table text-table'>
                            {row.persona.apellidoNombre}
                          </TableCell>
                          <TableCell style={{ minWidth: 100, maxWidth: 100 }} className='border-table text-table'>
                            {row.persona.razonSocial}
                          </TableCell>
                          <TableCell style={{ minWidth: 80, maxWidth: 80 }} className='border-table text-table' align="center">
                            {row.persona.celular}
                          </TableCell>
                          <TableCell style={{ minWidth: 150, maxWidth: 150 }} className='border-table text-table'>
                            {row.dependencia.name}
                          </TableCell>
                          <TableCell style={{ minWidth: 100, maxWidth: 100 }} className='border-table text-table' align="center">
                            <Button size='small' variant="contained" color="warning">
                              {pad(row.fecha[2], 2)}/{pad(row.fecha[1], 2)}/{row.fecha[0]}
                            </Button>
                          </TableCell>
                          <TableCell style={{ minWidth: 100, maxWidth: 100 }} className='border-table text-table' align="center">
                            <Button size='small' variant="contained" color="error">
                              {row.horaCancelar}
                            </Button>
                          </TableCell>
                          <TableCell style={{ minWidth: 150, maxWidth: 150 }} className='border-table text-table'>
                            {row.motivoCancelar}
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
              count={result.totalElements}
              rowsPerPage={state.rowsPerPage}
              page={state.page}
              onPageChange={onPageChange}
              onRowsPerPageChange={onRowsPerPageChange}
            />
          </CardContent>
        </Card>
      </LocalizationProvider>
    </>
  );

};

export default List;