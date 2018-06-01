import '../assets/css/reset.css';
import '../assets/css/finderjs.css';

import React, { Component } from 'react';

import {Controlled as CodeMirror} from 'react-codemirror2';

import 'codemirror/lib/codemirror.css';
import '../assets/css/themes/juno.css'; // codemirror custom theme

import 'codemirror/mode/smalltalk/smalltalk';
import 'codemirror/mode/yaml-frontmatter/yaml-frontmatter';
import 'codemirror/mode/gfm/gfm'; // github flavored markdown, used as base for yaml-frontmatter
import 'codemirror/mode/yaml/yaml';

import 'codemirror/addon/display/rulers';

import '../assets/css/App.css';

import ReactFinder from "react-finderjs";

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import '../assets/css/react-tabs.css';

import SplitPane from 'react-split-pane';
import '../assets/css/split.css';


import readdir from 'utils/readdir.js';
import saveFile from 'utils/saveFile.js';

import Empty from 'components/Empty.js';

import { ipcRenderer } from 'electron';

import fs from 'fs';
import path from 'path';

import defaultDoc from 'defaults/docs.js';

const meta = `categories: [template, example]
description: This is a yaml formatted metadata
contributors:
    - David Arias
`;



function calculateHeight(){

    // calculate the height of codemirror using the height of pane1 split

    let windowHeight = window.innerHeight;
    let pane1 = document.querySelector('.Pane1');

    if ( pane1 ){

        let pane1Size = pane1.clientHeight;

        let editorHeight = windowHeight - pane1Size - 28; // tabs list + 2 px borders

        let codeMirror = document.querySelectorAll('.CodeMirror');
        codeMirror.forEach( el => {
            el.style.height=`${editorHeight}px`;
        });
    }

}


// merge sourcem docs and metadata files into one object
// so we can show feed react component with all the data of the current node
function mergeSourceFiles( files ){
    let result = [];

    let byLabel = {};

    files.forEach( file => {

        let {label, path, id, content, ext, children} = file;

        // create baisc structure if doesn't exists
        if ( ! byLabel.hasOwnProperty(label) ){

            byLabel[label] = {
                label,
                path,
                id,
                source: null,
                doc: null,
                meta: null
            };
        }

        let obj = byLabel[label];

        switch ( ext ){
        case '.st':
            obj.source = content;
            break;
        case '.md':
            obj.doc = content;
            break;
        case '.yaml':
            obj.meta = content;
            break;
        default:
            break;
        }

        if ( children ){
            obj.children = mergeSourceFiles( children );
        }

    });


    for (let key in byLabel) {
        if ( byLabel.hasOwnProperty( key ) ) {
            result.push( byLabel[key] );
        }
    }

    return result;

}

function makeFileName(item){
    let {path, label} = item;

    let extensions = ['.st', '.md', '.yaml' ];

    let fileNames = {};

    extensions.forEach( ext => {
        fileNames[ext] = (`${path}/${label}${ext}`);
    });

    return fileNames;
}

function orderFiles( files ){

    function compareLabel(a, b) {
        if (a.label > b.label) {
            return 1;
        }
        if (a.label < b.label) {
            return -1;
        }
        return 0;
    };

    files.forEach( file => {
        if ( file.children ){
            orderFiles(file.children);
        }
    });

    files.sort(compareLabel);
}


const sourceOptions = {
	lineNumbers: true,
    theme: 'juno',
    mode: 'smalltalk',
    viewportMargin: Infinity,
    rulers : [{ color: "#4B5363", column : 80, lineStyle: "solid" }]
    // scrollbarStyle: null
};

const docOptions = {
	lineNumbers: false,
    theme: 'juno',
    mode: 'yaml-frontmatter',
    viewportMargin: Infinity,
    rulers : [{ color: "#4B5363", column : 80, lineStyle: "solid" }]
    // scrollbarStyle: null
};

const metaOptions = {
	lineNumbers: false,
    theme: 'juno',
    mode: 'yaml',
    viewportMargin: Infinity,
    rulers : [{ color: "#4B5363", column : 80, lineStyle: "solid" }]
};

function TabName({name, empty, modified}){
    return (
        <span className={empty ? 'line-through' : ''}>{modified ? '*' : ''}{name}</span>
    );

}

class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            basePath: null,
            files: [],

            item: {source: null, doc: null, meta: null}, // original item

            source: null,
            doc: defaultDoc,
            meta: meta,

            sourceEdited: false,
            docEdited: false,
            metaEdited: false,

            tabIndex: 0,

            openFileNames: []
        };

        window.addEventListener('resize', calculateHeight, true);

        ipcRenderer.on('save', (event, message) => {
            if ( message === 'save'){
                this.saveFiles();
            }
        });

        ipcRenderer.on('currentPathForOpen', (event, message) => {
            // send current item path to main, so we can open the new window
            // with the path
            let item = this.state.item;

            ipcRenderer.send('openFromPath', item);

        });

        ipcRenderer.on('loadPath', (event, message) => {
            this.loadPath(message);
        });

        ipcRenderer.on('loadPathAndSelect', (event, message) => {
            this.loadPath(message.path, message);
        });


        ipcRenderer.on('createObject', (event, message) => {

            if ( message.name){
                let item = this.state.item;

                let filePath;

                if (item.children){
                    filePath = path.join( item.path, item.label, message.name );
                }else{
                    filePath = path.join( item.path, message.name );
                }

                fs.mkdir( filePath, (err) => {
                    this.reloadFilesWithSelected();
                    if (err){
                        alert("This obejct already exsist in this location!");
                        console.error(err);
                    }
                });

            }

        });

        ipcRenderer.on('createMethod', (event, message) => {

            if ( message.name){

                let item = this.state.item;
                let filePath;

                if (item.children){
                    filePath = path.join( item.path, item.label, message.name + '.st' );
                }else{
                    filePath = path.join( item.path, message.name + '.st' );
                }

                fs.readFile(filePath, (err, data) => {
                    if (! err){
                        alert("This method already exsist in this location!");
                    }else{
                        fs.writeFile(filePath, message.name, (err) => {
                            if (err){
                                alert("Error write the file");
                                console.error(err);
                            }
                            this.reloadFilesWithSelected();
                        });
                    }
                });
            }


        });

        ipcRenderer.on('rename', (event, message) => {

            let { path } = this.state.item;

        });

        ipcRenderer.on('selectXY', (event, message) => {
            document.elementFromPoint(message.x, message.y).click();
        });

    }

    loadPath(path, item){

        this.setState({basePath: path});

        readdir(path, (err, res) => {
            if(err){
                alert("Error reading directory, please contat support");
                console.error(err);
            }else{

                let files = mergeSourceFiles(res);
                orderFiles( files );

                this.setState( { files: files, finderValue: item } ) ;

                calculateHeight();
            }
        });

        calculateHeight();
    }


    reloadFiles(){
        this.loadPath(this.state.basePath);
    }

    reloadFilesWithSelected(){
        this.loadPath(this.state.basePath, this.state.item);
    }

    componentDidMount(){

    }

    saveFiles(){
        // save files if modified

        let pendingSave = 0;
        let errors = [];

        let onSaveFile = (err, path) => {
            pendingSave--;
            if (err){
                console.error(err);
                errors.push(err);
            }else{
                console.log( `File ${path} saved!`);
            }

            // when all save operations are finished report errors
            // and reload files to fix posible incosistencies
            if ( pendingSave == 0 && errors.length > 0){

                errors.forEach( error => {
                    console.error( error );
                });

                this.reloadFiles();
            }

        };

        if ( this.state.item.source !== this.state.source ){
            let fileName = this.state.openFileNames['.st'];

            // update item reference, so when loading this node again shows
            // the correct value
            this.state.item.source = this.state.source;

            pendingSave++;
            saveFile(fileName, this.state.source, onSaveFile );
        }

        if ( this.state.item.doc !== this.state.doc && this.state.doc !== defaultDoc ){
            let fileName = this.state.openFileNames['.md'];

            // update item reference, so when loading this node again shows
            // the correct value
            this.state.item.doc = this.state.doc;

            pendingSave++;
            saveFile( fileName, this.state.doc, onSaveFile );
        }

        if ( this.state.item.meta !== this.state.meta && this.state.meta !== meta ){
            let fileName = this.state.openFileNames['.yaml'];

            // update item reference, so when loading this node again shows
            // the correct value
            this.state.item.meta = this.state.meta;

            pendingSave++;
            saveFile( fileName, this.state.meta, onSaveFile );
        }

        // to remove modified '*' from tab list
        this.forceUpdate();

    }

    onItemSelected(item){
        this.saveFiles();

        this.setState( {
            item: item,

            source: item.source,
            doc: (item.doc || defaultDoc),
            meta: (item.meta || meta)

        } ) ;

        if (item.source === null && item.doc !== null){
            this.setState({tabIndex: 1});
        }else if( item.source !== null ){
            this.setState({tabIndex: 0});
        }

        this.setState({ openFileNames: makeFileName(item) });

    }

    onEditSource(editor, data, value){
    }

    onBeforeEditSource(editor, data, value){
        this.setState( { source: value } ) ;
    }

    onEditDoc(editor, data, value){
    }

    onBeforeEditDoc(editor, data, value){
        this.setState( { doc: value } ) ;
    }

    onEditMeta(editor, data, value){
    }

    onBeforeEditMeta(editor, data, value){
        this.setState( { meta: value } ) ;
    }


    render() {
        if ( this.state.basePath === null ){
            return (<Empty />);
        }else{
            return (
                <SplitPane split="horizontal" defaultSize={400}
                           onChange={ size => { calculateHeight(); } }>

                  <ReactFinder
                    className = ""
                    value={this.state.finderValue}
                    data = {this.state.files}
                    onItemSelected={this.onItemSelected.bind(this)}/>

                  <Tabs
                    domRef={(el) => { if (el !== null) { calculateHeight(); } }}
                    selectedIndex={this.state.tabIndex}
                    onSelect={tabIndex => this.setState({ tabIndex })}>

                    <TabList>
                      <Tab>
                        <TabName name='Source'
                                 empty={this.state.source === null}
                                 modified={this.state.item.source !== this.state.source}/>
                      </Tab>

                      <Tab>
                        <TabName name='Document'
                                 empty={this.state.doc === defaultDoc}
                                 modified={this.state.item.doc !== this.state.doc && this.state.doc !== defaultDoc}/>
                      </Tab>

                      <Tab>
                        <TabName name='Meta'
                                 empty={this.state.meta === meta}
                                 modified={ this.state.item.meta !== this.state.meta && this.state.meta !== meta}/>
                      </Tab>
                    </TabList>

                    <TabPanel>
                      <CodeMirror value={this.state.source} options={sourceOptions}
                                  onBeforeChange={this.onBeforeEditSource.bind(this)}
                                  onChange={this.onEditSource.bind(this)}/>

                    </TabPanel>
                    <TabPanel>
                      <CodeMirror value={this.state.doc} options={docOptions}
                                  onBeforeChange={this.onBeforeEditDoc.bind(this)}
                                  onChange={this.onEditDoc.bind(this)}
                                  />
                    </TabPanel>
                    <TabPanel>
                      <CodeMirror value={this.state.meta} options={metaOptions}
                                  onBeforeChange={this.onBeforeEditMeta.bind(this)}
                                  onChange={this.onEditMeta.bind(this)}
                                  />
                    </TabPanel>
                  </Tabs>

                </SplitPane>

            );
        }
    }
}

export default App;
