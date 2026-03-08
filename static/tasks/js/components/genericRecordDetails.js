import $A from "../helper.js";

/**
 * Generic mapper - nests all keys found in returned data, inside
 * containerId shell. 
 */
export default function(data, containerId) {
    // weeds out Response from containerId...
    let parentId = containerId.replace(/Response$/,'');
    let container = document.getElementById(parentId);
    
    if ($A.generic.checkVariableType(container) !== 'domelement') {
        throw new Error('genericRecordDetails() could not find containerId in DOM.')
    }

    container.appendChild($A.generic.loopObject(data, (key, value) => {
        let elem = $A.app.makeDomElement('span', 'rec-itm '+ key);
        elem.innerHTML = value;
        return elem;
    }));
};
