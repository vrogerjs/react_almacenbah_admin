import React, { useState, useEffect, useRef } from 'react';
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { transform } from 'ol/proj'
import { useDispatch } from "react-redux";
import { debounce, useResize, http } from 'gra-react-utils';
import { TileWMS as _TileWMS, ImageWMS as _ImageWMS, OSM } from 'ol/source';
import { Tile as _Tile, Image as _Image } from 'ol/layer';
import * as proj from 'ol/proj';

import 'ol/ol.css';

const MapPanel = (props) => {

  const { width, height } = useResize(React);

  useEffect(() => {
    if (mapElement.current) {
      const header = document.querySelector('.MuiToolbar-root');

      
      const body = mapElement.current;
      const nav = document.querySelector('nav');
      header.children[0].style.marginLeft =  nav.offsetWidth+ 'px';
      body.style.height = (height - header.offsetHeight) + 'px';
      body.style.maxWidth = (width - nav.offsetWidth) + 'px';
    }
    if (map)
      setTimeout(function () { map.updateSize(); }, 200);
  }, [width, height]);

  const dispatch = useDispatch();

  const [map, setMap] = useState()

  const [featuresLayer, setFeaturesLayer] = useState()

  const [selectedCoord, setSelectedCoord] = useState()

  const mapElement = useRef()

  const mapRef = useRef()

  mapRef.current = map

  useEffect(() => {
    const initalFeaturesLayer = new VectorLayer({
      source: new VectorSource()
    })
    if (mapElement.current && mapElement.current.children.length == 0) {

      const initialMap = new Map({
        target: mapElement.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),

          initalFeaturesLayer

        ],
        view: new View({
          projection: 'EPSG:3857',
          center: proj.transform([-77.5275351,-9.4871398], 'EPSG:4326', 'EPSG:3857'),
          zoom: 8
        }),
        controls: []
      })
      initialMap.on('click', handleMapClick)
      initialMap.on('rendercomplete', () => {
        setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 200);

      })
      console.log('initial map');
      setMap(initialMap)
      setFeaturesLayer(initalFeaturesLayer)




  

      var oLayer = _Tile;
      var source = _TileWMS;

      /*if (la[j].type == "I") {
        oLayer = _Image;
        source = _ImageWMS;
      }*/


      [
        
        {label: 'Distritos', address: 'dremh:DISTRITO', visible: true},
        {address: 'gra:disabled', visible: true}
      ].forEach((layer)=>{ 
        var dd = layer.address.split(":");
        var par = {
          LAYERS: layer.address,
          TILED: true,
        };
        var l = new oLayer({
          source: new source({
            url: //me.baseURL 
              'http://web.regionancash.gob.pe'
              + "/geoserver/" + dd[0] + "/wms",
            params: par,
            serverType: "geoserver",
            // Countries have transparency, so do not fade tiles:
            transition: 0,
          }),
        });
  
        initialMap.addLayer(l);
      });




    }
    dispatch({ type: 'title', title: 'Mapa' });
  }, [])

  useEffect(() => {

    if ((props.features || []).length) { // may be null on first render
      featuresLayer.setSource(
        new VectorSource({
          features: props.features // make sure features is an array
        })
      )
      map.getView().fit(featuresLayer.getSource().getExtent(), {
        padding: [100, 100, 100, 100]
      })

    }

  }, [props.features])

  // map click handler
  const handleMapClick = (event) => {

    const clickedCoord = mapRef.current.getCoordinateFromPixel(event.pixel);

    const transormedCoord = transform(clickedCoord, 'EPSG:3857', 'EPSG:4326')

    setSelectedCoord(transormedCoord)

    console.log(transormedCoord)

  }

  

  return <>
    <div ref={mapElement} className="map-container"></div>
  </>;

}

export default MapPanel;