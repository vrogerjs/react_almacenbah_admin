import React, { useEffect } from 'react';
import {
  Mail as MailIcon,
  Menu as MenuIcon,
  InsertChart as ChartIcon,
  Map as MapIcon,
  Add as AddIcon,
  Quiz as QuizIcon,
  Logout as LogoutIcon,
  Group as GroupIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import {
  Alert, AppBar, Box, CssBaseline, Drawer, Divider, IconButton, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Snackbar, Toolbar,
  Typography
} from '@mui/material';
import { debounce } from 'gra-react-utils';
import lazyLoader from "./utils/LazyLoader";

import {
  Routes,
  Route, useLocation,
  useNavigate
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

function VDrawer(props) {
  const dispatch = useDispatch();

  const onClose = () => { dispatch({ type: "drawer" }) };
  const drawer = useSelector((state) => state.drawer);
  return <Drawer variant="temporary"
    open={drawer}
    onClose={onClose}
    ModalProps={{
      keepMounted: true, // Better open performance on mobile.
    }}
    sx={{
      display: { xs: 'block', sm: 'none' },
      '& .MuiDrawer-paper': { boxSizing: 'border-box', width: props.width },
    }}>
    {props.children}
  </Drawer>
}

function VSnackbar() {
  const snack = useSelector((state) => state.snack);

  const dispatch = useDispatch();

  const onClose = () => { dispatch({ type: "snack" }) };

  return <Snackbar open={!!snack}
    sx={{ bottom: 70 }}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    autoHideDuration={2000} onClose={onClose}>
    {<Alert severity="success" variant="filled" onClose={onClose} sx={{ width: '100%' }}>
      {snack ? snack.msg : ''}
    </Alert>
    }
  </Snackbar>;
}

function VAppBar(props) {

  const networkStatus = useSelector((state) => state.networkStatus);

  return <AppBar style={{ 'background': networkStatus.connected ? '' : 'red' }} {...props}
    position="fixed"
  >{props.children}</AppBar>;

}

const HomePage = ({ logOut, match }) => {

  const setO = React.useState({ title: 'Cuestionarios Discapacidad' })[1];

  const [perms, setPerms] = React.useState([]);

  const dispatch = useDispatch();

  const title = useSelector((state) => state.title);

  const handleDrawerToggle = () => {
    dispatch({ type: 'drawer' });
  };

  const items = [
    {
      perms: 'ADMIN_ALMACEN_BAH', text: 'Definición de Productos', icon: <QuizIcon />, path: '/producto', items: [
        { text: 'Gestión de Marcas', icon: <AddIcon />, path: '/marca' },
        { text: 'Gestión de Unidades', icon: <AddIcon />, path: '/unidad' },
        { text: 'Gestión de Proveedores', icon: <AddIcon />, path: '/proveedor' },
        { text: 'Gestión de Personas', icon: <AddIcon />, path: '/persona' },
        { text: 'Gestión de Productos', icon: <AddIcon />, path: '/producto' },
      ]
    },
    {
      perms: 'ADMIN_ALMACEN_BAH', text: 'Gestión de Almacén', icon: <QuizIcon />, path: '/marca', items: [
        { text: 'Nuevo Ingreso de Productos', icon: <AddIcon />, path: '/ingresoproducto/create' },
        { text: 'Ingresos Registrados', icon: <AddIcon />, path: '/ingresoproducto' },
        { text: 'Nueva Salida de Productos', icon: <AddIcon />, path: '/salidaproducto/create' },
        { text: 'Salidas Registradas', icon: <AddIcon />, path: '/salidaproducto' }
      ]
    },
    {
      perms: 'REGISTER_ALMACEN_BAH', text: 'Atenciones Pendientes', icon: <QuizIcon />, path: '/atencion'
    },
    {
      perms: 'REGISTER_ALMACEN_BAH', text: 'Atenciones Finalizadas', icon: <QuizIcon />, path: '/atencion/finalizada'
    },
    {
      perms: 'REGISTER_ALMACEN_BAH', text: 'Atenciones Canceladas', icon: <QuizIcon />, path: '/atencion/cancelada'
    },
    // {
    //   perms: 'ADMIN_ALMACEN_BAH', text: 'Reportes', icon: <QuizIcon />, path: '/reporte/fechas', items: [
    //     { text: 'Reporte por Rango de Fechas', icon: <AddIcon />, path: '/reporte/fechas' },
    //     { text: 'Reporte por Dependencia', icon: <AddIcon />, path: '/reporte/dependencia' }
    //   ]
    // },
    {
      text: 'Salir', icon: <LogoutIcon />, onClick: () => {
        logOut();
      }
    }
  ]

  const drawer = (
    <div className='bg-gore'>
      <Toolbar>
        <Box
          component="img"
          sx={{
            width: 150,
            marginBottom: 2,
            // maxHeight: { xs: 233, md: 167 },
            // maxWidth: { xs: 350, md: 250 },
          }}
          alt="Logo GORE Áncash."
          // src="https://web.regionancash.gob.pe/fs/images/logo2018.png"
          src={process.env.PUBLIC_URL + "/logo20181.png"}
        />
      </Toolbar>
      <Divider />
      <List className='sidebar-gore'>
        {items.filter((e) => {
          return e.perms ? perms.includes(e.perms) : true;
        }).map((item, index0) => (
          <React.Fragment key={'List_' + index0} >
            <ListItem>
              <ListItemButton onClick={item.onClick ? item.onClick : () => {
                handleDrawerToggle();
                navigate(item.path);
              }}>
                <ListItemIcon>
                  {item.icon || <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={item.text} />

              </ListItemButton>
            </ListItem>
            {item.items?.map((item, index) => (
              <ListItem key={'List_' + index0 + '_' + index} disablePadding style={{ paddingLeft: '40px' }}>
                <ListItemButton onClick={item.onClick ? item.onClick : () => {
                  handleDrawerToggle();
                  navigate(item.path);
                }}>
                  <ListItemIcon>
                    {item.icon || <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />

                </ListItemButton>
              </ListItem>
            ))}

          </React.Fragment>
        ))}
      </List>
    </div>
  );

  let location = useLocation();

  useEffect(() => {
    try {
      var s = localStorage.getItem("perms");
      if (s) {
        s = JSON.parse(s);
        setPerms(s);
      }
    } catch (e) {
      console.log(e);
    }
  }, []);

  const formRef = React.createRef();

  useEffect(() => {
    // const debouncedHandleResize = debounce((width, height) => {
    //   const header = document.querySelector('.MuiToolbar-root');
    //   const body = formRef.current;
    //   if (body)
    //     body.style.height = (height - header.offsetHeight * 0) + 'px';
    // });
    // debouncedHandleResize();
    // window.addEventListener('resize', debouncedHandleResize)
    // return _ => {
    //   window.removeEventListener('resize', debouncedHandleResize)
    // }
  }, [location, formRef]);

  const drawerWidth = 240;

  let navigate = useNavigate();

  const ChartPanel = lazyLoader(() => import('./screens/Charts'));

  const MapPanel = lazyLoader(() => import('./screens/Map'));

  // Marcas
  const MarcaList = lazyLoader(() => import('./screens/marca/List'));
  const MarcaForm = lazyLoader(() => import('./screens/marca/Form')
    .then(module => ({ default: module.Form }))
  );

  // Unidades
  const UnidadList = lazyLoader(() => import('./screens/unidad/List'));
  const UnidadForm = lazyLoader(() => import('./screens/unidad/Form')
    .then(module => ({ default: module.Form }))
  );

  // Proveedores
  const ProveedorList = lazyLoader(() => import('./screens/proveedor/List'));
  const ProveedorForm = lazyLoader(() => import('./screens/proveedor/Form')
    .then(module => ({ default: module.Form }))
  );

  // Personas
  const PersonaList = lazyLoader(() => import('./screens/persona/List'));
  const PersonaForm = lazyLoader(() => import('./screens/persona/Form')
    .then(module => ({ default: module.Form }))
  );

  // Productos
  const ProductoList = lazyLoader(() => import('./screens/producto/List'));
  const ProductoForm = lazyLoader(() => import('./screens/producto/Form')
    .then(module => ({ default: module.Form }))
  );

  // Ingreso de Productos
  const IngresoproductoList = lazyLoader(() => import('./screens/ingresoproducto/List'));
  const IngresoproductoListingreso = lazyLoader(() => import('./screens/ingresoproducto/Listingreso'));
  const IngresoproductoForm = lazyLoader(() => import('./screens/ingresoproducto/Form')
    .then(module => ({ default: module.Form }))
  );

  // Salida de Productos
  const SalidaproductoList = lazyLoader(() => import('./screens/salidaproducto/List'));
  const SalidaproductoListsalida = lazyLoader(() => import('./screens/salidaproducto/Listsalida'));
  const SalidaproductoForm = lazyLoader(() => import('./screens/salidaproducto/Form')
    .then(module => ({ default: module.Form }))
  );

  // Cronograma
  const CronogramaList = lazyLoader(() => import('./screens/cronograma/List'));
  const CronogramaForm = lazyLoader(() => import('./screens/cronograma/Form')
    .then(module => ({ default: module.Form }))
  );

  // Dependencia
  const DependenciaList = lazyLoader(() => import('./screens/dependencia/List'));
  const DependenciaForm = lazyLoader(() => import('./screens/dependencia/Form')
    .then(module => ({ default: module.Form }))
  );

  // Atenciones
  const AtencionList = lazyLoader(() => import('./screens/atencion/List'));
  const AtencionListEnd = lazyLoader(() => import('./screens/atencion/ListEnd'));
  const AtencionListCancel = lazyLoader(() => import('./screens/atencion/ListCancel'));

  // Reportes
  // const ReporteListFechas = lazyLoader(() => import('./screens/reporte/ListFechas'));
  // const ReporteListDependencia = lazyLoader(() => import('./screens/reporte/ListDependencia'));

  const UserList = lazyLoader(() => import('./screens/user/List'));

  const UserForm = lazyLoader(() => import('./screens/user/Form')
    .then(module => ({ default: module.Form }))
  );

  const ProfileForm = lazyLoader(() => import('./screens/Profile')
    .then(module => ({ default: module.Form }))
  );

  const SettingForm = lazyLoader(() => import('./screens/Setting')
    .then(module => ({ default: module.Form }))
  );


  return (
    <Box
      sx={{ display: 'flex' }}>
      <CssBaseline />
      <VAppBar
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {title}
          </Typography>
        </Toolbar>
      </VAppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <VDrawer

          onClose={handleDrawerToggle}
          width={drawerWidth}
        >
          {drawer}
        </VDrawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box ref={formRef}
        component="main"
        sx={{ flexGrow: 1, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar className="_" />
        <Routes>

          {/* Marca */}
          <Route path={`/marca`} element={<MarcaList setO={setO} />} />
          <Route path={`/marca/create`} element={<MarcaForm />} />
          <Route path={`/marca/:pid/edit`} element={<MarcaForm />} />

          {/* Unidad */}
          <Route path={`/unidad`} element={<UnidadList setO={setO} />} />
          <Route path={`/unidad/create`} element={<UnidadForm />} />
          <Route path={`/unidad/:pid/edit`} element={<UnidadForm />} />

          {/* Proveedor */}
          <Route path={`/proveedor`} element={<ProveedorList setO={setO} />} />
          <Route path={`/proveedor/create`} element={<ProveedorForm />} />
          <Route path={`/proveedor/:pid/edit`} element={<ProveedorForm />} />

          {/* Persona */}
          <Route path={`/persona`} element={<PersonaList setO={setO} />} />
          <Route path={`/persona/create`} element={<PersonaForm />} />
          <Route path={`/persona/:pid/edit`} element={<PersonaForm />} />

          {/* Producto */}
          <Route path={`/producto`} element={<ProductoList setO={setO} />} />
          <Route path={`/producto/create`} element={<ProductoForm />} />
          <Route path={`/producto/:pid/edit`} element={<ProductoForm />} />

          {/* Ingreso de Productos */}
          <Route path={`/ingresoproducto`} element={<IngresoproductoList setO={setO} />} />
          <Route path={`/ingresoproducto/:pid/ver`} element={<IngresoproductoListingreso setO={setO} />} />
          <Route path={`/ingresoproducto/create`} element={<IngresoproductoForm />} />
          <Route path={`/ingresoproducto/:pid/edit`} element={<IngresoproductoForm />} />

          {/* Salida de Productos */}
          <Route path={`/salidaproducto`} element={<SalidaproductoList setO={setO} />} />
          <Route path={`/salidaproducto/:pid/ver`} element={<SalidaproductoListsalida setO={setO} />} />
          <Route path={`/salidaproducto/create`} element={<SalidaproductoForm />} />
          <Route path={`/salidaproducto/:pid/edit`} element={<SalidaproductoForm />} />



          {/* Dependencia */}
          <Route path={`/dependencia`} element={<DependenciaList setO={setO} />} />
          <Route path={`/dependencia/create`} element={<DependenciaForm />} />
          <Route path={`/dependencia/:pid/edit`} element={<DependenciaForm />} />

          {/* Cronograma */}
          <Route path={`/cronograma`} element={<CronogramaList setO={setO} />} />
          <Route path={`/cronograma/create`} element={<CronogramaForm />} />
          <Route path={`/cronograma/:pid/edit`} element={<CronogramaForm />} />

          {/* Atencion */}
          <Route path={`/atencion`} element={<AtencionList setO={setO} />} />
          <Route path={`/atencion/finalizada`} element={<AtencionListEnd setO={setO} />} />
          <Route path={`/atencion/cancelada`} element={<AtencionListCancel setO={setO} />} />

          {/* Reportes */}
          {/* <Route path={`/reporte/fechas`} element={<ReporteListFechas setO={setO} />} /> */}
          {/* <Route path={`/reporte/dependencia`} element={<ReporteListDependencia setO={setO} />} /> */}

          <Route path={`/user`} element={<UserList setO={setO} />} />
          <Route path={`/user/create`} element={<UserForm />} />
          <Route path={`/user/:uid/edit`} element={<UserForm />} />
          <Route path={`/charts`} element={<ChartPanel />} />
          <Route path={`/map`} element={<MapPanel />} />
          <Route path={`/setting`} element={<SettingForm />} />
          <Route path={`/profile`} element={<ProfileForm />} />
        </Routes>
      </Box>

      <VSnackbar />
    </Box>
  );

};

export default HomePage;