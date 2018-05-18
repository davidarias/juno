import React, { Component } from 'react';

import { ipcRenderer } from 'electron';

function Empty(){

    return (
        <div className="no-project">
          <h1>No Project selected</h1>
          <p>{'Go to: File > Open Project Folder'}</p>
          <p>{'or Press Ctrl+o'}</p>
        </div>
    );
}

export default Empty;
