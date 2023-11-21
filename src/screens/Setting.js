import React, { useState, useEffect, createRef } from 'react';
import { useFormState, http, useResize } from 'gra-react-utils';
import { VRadioGroup } from '../utils/useToken';
import Dexie from 'dexie';
import {
  Send as SendIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Cancel as CancelIcon ,
   Search as SearchIcon,
   SetMealOutlined
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Accordion, AccordionDetails, InputLabel, Input, IconButton,
  Box, Button, Checkbox, Fab, FormHelperText,InputAdornment,
  FormControl, FormControlLabel, FormGroup, FormLabel, MenuItem, Radio,
  RadioGroup, Stack, TextField
} from '@mui/material';
import {
  useNavigate, useParams, useLocation
} from "react-router-dom";
import { useDispatch } from "react-redux";
import { db } from '../db';

export const Form = () => {

  const dispatch = useDispatch();

  const location = useLocation();

  const { uid } = useParams();

  const formRef = createRef();

  const navigate = useNavigate();

  const [regions, setRegions] = useState([]);

  const [provinces, setProvinces] = useState([]);

  const [districts, setDistricts] = useState([]);

  const [reds, setReds] = useState([]);

  const [microreds, setMicroreds] = useState([]);

  const [o, { defaultProps, handleChange, bindEvents, validate, set }] = useFormState(useState, {
    'status': '1',
  }, {});

  const [open] = useState(true);

  useEffect(() =>  {
    dispatch({ type: 'title', title: 'Configuración' });
    [
      //["/admin/directory/api/town/0/0", "town"],
      ["red",setReds],
      ["microred",setMicroreds],
      //["/admin/desarrollo-social/api/establishment/0/0", "establishment"],
      ["region",setRegions],
      ["province",setProvinces],
      [ "district",setDistricts],
     // ["/api/poll/sample/0/0", "sample"],
    ].forEach(async (e) => {
      e[1](await db[e[0]].toArray());
    });
    

    try {
      var s = localStorage.getItem("setting");
      if (s) {
        s = JSON.parse(s);
        var o = {};
        o.red = s.red;
        o.microred = s.microred;
        o.region = s.region;
        o.province = s.province;
        o.district = s.district;
        o.establishment = s.establishment;
        o.town = s.town;
        set(o);
      }
    } catch (e) {
      console.log(e);
    }
  }, []);

  const { width, height } = useResize(React);

  useEffect(() => {
    if (formRef.current) {
      const header = document.querySelector('.MuiToolbar-root');
      const [body, toolBar] = formRef.current.children;
      const nav = document.querySelector('nav');
      body.style.height = (height - header.offsetHeight - toolBar.offsetHeight) + 'px';
      toolBar.style.width = (width - nav.offsetWidth) + 'px';
    }
  }, [width, height]);

  const onClickRetrieve = () => {
    [
      ["/api/grds/red/0/0", "red",setReds],
      ["/api/grds/microred/0/0", "microred",setMicroreds],
      //["/admin/desarrollo-social/api/establishment/0/0", "establishment"],
      ["/admin/directory/api/region/0/0", "region",setRegions],
      ["/admin/directory/api/province/0/0", "province",setProvinces],
      ["/admin/directory/api/district/0/0", "district",setDistricts]
    ].forEach((e) => {
      http.get(e[0]).then(function(data){
        var table=db[e[1]];
        table.clear().then(()=>{
          console.log(e[0]);
          data=data.data||data;
          table.bulkAdd(data).then(function(lastKey) {
            if(e[2]){
              e[2](data);
            }
          }).catch(function (e) {
            console.log(e)
          });
        });
        
      });
    });
    //navigate(-1);
  }

  const onClickAdd = () => {
    navigate('/user/create', { replace: true });
  }

  const onClickSave = () => {
    localStorage.setItem("setting", JSON.stringify(o));
    dispatch({ type: "snack", msg: 'Registro grabado!' });
  };

  useEffect(() => {
    const form = formRef.current;
    if (form != null) {
      return bindEvents(form);
    }
  }, [o, open]);

  const onSubmit = data => console.log(data);

  const theme = createTheme({
    components: {
      // Name of the component ⚛️
      MuiInput: {
        defaultProps: {
          required: true
        }
      },
    },
  });

  function getActions() {
    return <>
      <Button variant="contained" onClick={onClickRetrieve} color="primary">
        Recuperar
      </Button>
      <Button variant="contained" onClick={onClickSave} color="primary" endIcon={<SendIcon />}>
        Grabar
      </Button>
    </>
  }

  function getContent() {
    return <ThemeProvider theme={theme}>
      <form ref={formRef} onSubmit={onSubmit} style={{ textAlign: 'left' }}>
        <Box style={{ overflow: 'auto' }}>
          <Accordion expanded={true}>
            <AccordionDetails >
            <TextField
                select
                label="Región"
                {...defaultProps("region")}
              >
                {regions.map((item, i) => (
                  <MenuItem key={'region_' + i} value={item.code}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Provincia"
                {...defaultProps("province")}
              >
                {provinces.filter((e)=>e.code.startsWith(o['region'])).map((item, i) => (
                  <MenuItem key={'province_' + i} value={item.code}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Distrito"
                {...defaultProps("district")}
              >
                {districts.filter((e)=>e.code.startsWith(o['province'])).map((item, i) => (
                  <MenuItem key={'district_' + i} value={item.code}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Red"
                {...defaultProps("red")}
              >
                {reds.map((item, i) => (
                  <MenuItem key={'red_' + i} value={item.code}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Microred"
                {...defaultProps("microred")}
              >
                {microreds.filter((e)=>e.code.startsWith(o['red'])).map((item, i) => (
                  <MenuItem key={'microred_' + i} value={item.code}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
            </AccordionDetails>
          </Accordion>


        </Box>
        <Stack direction="row" justifyContent="center"
          style={{ padding: '10px', backgroundColor: '#1976d2' }}
          alignItems="center" spacing={1}>
          {getActions()}
        </Stack>

        {o._id && <Fab color="primary" aria-label="add"
          onClick={onClickAdd}
          style={{
            position: 'absolute',
            bottom: 80, right: 24
          }}>
          <AddIcon />
        </Fab>}
      </form>
    </ThemeProvider>
  }
  return <>{
    1 == 1 ? <Box style={{ textAlign: 'left' }}>{getContent()}</Box>
      : <Box
        sx={{ display: 'flex' }}>
      </Box>
  }
  </>;

}