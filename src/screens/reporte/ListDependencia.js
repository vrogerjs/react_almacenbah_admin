import React, { useState, useEffect, useRef } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import {
  Button, Checkbox, Fab, styled, Table, TableCell, TextField, TablePagination,
  TableHead, TableBody, TableRow, TableContainer, Toolbar, Grid, MenuItem, CardContent, Card, Typography
} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { Autorenew, Keyboard, ManageSearch, PictureAsPdf } from '@mui/icons-material';
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

  const [o, { defaultProps, set }] = useFormState(useState, {
    dependencia: 0,
    'fechaIni': hoy(),
    'fechaFin': hoy(),
  }, {});

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

  const onClickRefresh = () => {
    setSelected([]);
    fetchData(state.page);
  };

  const printOnClick = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Listado de Atenciones Finalizadas.',
    onAfterPrint: () => dispatch({ type: "snack", msg: 'Listado de Atenciones por Dependencia impreso.!' }),
  });

  const fetchData = async () => {
    var data = { data: [] };
    if (networkStatus.connected) {
      const result = await http.get(process.env.REACT_APP_PATH + '/atencion/report/dependencia/fechas?IdDependencia=' + o.dependencia + '&fechaIni=' + o.fechaIni + '&fechaFin=' + o.fechaFin);
      data.size = result.length;
      data.data = data.data.concat(result);
    }
    setResult(data);
  };

  const toDate = (d) => {
    if (d && d.toDate) {
      d = d.toDate();
      var day = pad(d.getDate(), 2);
      var month = pad(d.getMonth() + 1, 2);
      var year = d.getFullYear();
      d = year + '-' + month + '-' + day;
    }
    return d;
  }

  function hoy() {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = hoy.getMonth() + 1;
    const day = hoy.getDate();
    const date = year + '-' + pad(month, 2) + '-' + pad(day, 2);
    return date;
  }

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
    dispatch({ type: 'title', title: 'Reporte de Atenciones al Ciudadano por Dependencia - GORE Áncash' });
    fetchData(state.page)
  }, [state.page, state.rowsPerPage]);

  useEffect(() => {
    // if(o.dependencia)
    onClickRefresh();
    // alert(o.dependencia);
  }, [o.dependencia]);

  function onChangeFechaIni(v) {
    o.fechaIni = v;
    set(o => ({ ...o, fechaIni: v }));
  }

  function onChangeFechaFin(v) {
    o.fechaFin = v;
    set(o => ({ ...o, fechaFin: v }));
  }

  const onClickSearch = async () => {
    if (o.fechaIni != null && o.fechaFin != null) {

      if (o.fechaIni.toDate) {
        var fechaIni = o.fechaIni.toDate();
        var day = pad(fechaIni.getDate(), 2);
        var month = pad(fechaIni.getMonth() + 1, 2);
        var year = fechaIni.getFullYear();
        var v1 = year + '-' + month + '-' + day;
      } else {
        var v1 = o.fechaIni;
      }

      if (o.fechaFin.toDate) {
        var fechaFin = o.fechaFin.toDate();
        var day = pad(fechaFin.getDate(), 2);
        var month = pad(fechaFin.getMonth() + 1, 2);
        var year = fechaFin.getFullYear();
        var v2 = year + '-' + month + '-' + day;
      } else {
        var v2 = o.fechaFin;
      }

      if (v1 <= v2) {

        var data = { data: [] };
        if (networkStatus.connected) {
          const result = await http.get(process.env.REACT_APP_PATH + '/atencion/report/dependencia/fechas?IdDependencia=' + o.dependencia + '&fechaIni=' + v1 + '&fechaFin=' + v2);
          data.size = result.length;
          data.data = data.data.concat(result);
        }
        setResult(data);

      } else {
        dispatch({ type: "snack", msg: 'La Fecha Inicio debe de ser menor o igual a la Fecha Fin.', severity: 'warning' });
      }

    } else {
      dispatch({ type: "snack", msg: 'Ingrese la Fecha Inicio y Fin.', severity: 'warning' });
    }
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
              <Grid container spacing={1}>
                <Grid item xs={12} md={2}>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button sx={{ width: '100%', fontWeight: 'bold' }} onClick={onClickSearch} startIcon={<ManageSearch />} variant="contained" color="primary">Buscar</Button>
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
              <Grid item xs={12} sm={12} md={12}>
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
              <Grid item xs={12} sm={6} md={6}>
                <DesktopDatePicker
                  label="Ingrese la Fecha Inicio."
                  inputFormat="DD/MM/YYYY"
                  value={o.fechaIni || ''}
                  onChange={onChangeFechaIni}
                  renderInput={(params) =>
                    <TextField
                      type={'number'}
                      sx={{ fontWeight: 'bold' }}
                      margin="normal"
                      required
                      fullWidth
                      id="standard-name"
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
              <Grid item xs={12} sm={6} md={6} className='mb-2'>
                <DesktopDatePicker
                  label="Ingrese la Fecha Fin."
                  inputFormat="DD/MM/YYYY"
                  value={o.fechaFin || ''}
                  onChange={onChangeFechaFin}
                  renderInput={(params) =>
                    <TextField
                      type={'number'}
                      sx={{ fontWeight: 'bold' }}
                      margin="normal"
                      required
                      fullWidth
                      id="standard-name"
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
            <Card ref={componentRef} className='padding-print'>
              <Typography sx={{ fontSize: 18 }} gutterBottom className='text-uppercase fw-bold text-center'>
                Listado de Atenciones desde el {toDate(o.fechaIni)} hasta {toDate(o.fechaFin)}
              </Typography>
              <TableContainer sx={{ maxWidth: '100%', mx: 'auto', maxHeight: '540px' }}>
                <Table stickyHeader aria-label="sticky table" ref={componentRef} className='padding-print'>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell style={{ minWidth: 80, maxWidth: 80 }} className='bg-gore border-table text-table'>GERENCIA Y/O SUBGERENCIA Y/O ÁREA Y/O UNIDAD Y/O OFICINA
                        {/* <TextField {...defaultProps('dependencia')} style={{ padding: 0, marginTop: '5px !important' }} /> */}
                      </StyledTableCell>
                      <StyledTableCell style={{ minWidth: 80, maxWidth: 80 }} className='bg-gore border-table text-table'>TOTAL DE CIUDADANOS ATENDIDOS
                        {/* <TextField {...defaultProps('abreviatura')} style={{ padding: 0, marginTop: '5px !important' }} /> */}
                      </StyledTableCell>
                      <StyledTableCell style={{ minWidth: 50, maxWidth: 50 }} className='bg-gore border-table text-table'>FECHA DE ATENCIÓN
                        {/* <TextField {...defaultProps('abreviatura')} style={{ padding: 0, marginTop: '5px !important' }} /> */}
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
                            <TableCell style={{ minWidth: 80, maxWidth: 80 }} className='border-table text-table' align="left">
                              {row[0]}
                            </TableCell>
                            <TableCell style={{ minWidth: 80, maxWidth: 80 }} className='border-table text-table' align="center">
                              {row[1]}
                            </TableCell>
                            <TableCell style={{ minWidth: 50, maxWidth: 50 }} className='border-table text-table' align="center">
                            {pad(row[2][2], 2)}/{pad(row[2][1], 2)}/{row[2][0]}
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
            </Card>
          </CardContent>
        </Card>
      </LocalizationProvider>
    </>
  );

};

export default List;