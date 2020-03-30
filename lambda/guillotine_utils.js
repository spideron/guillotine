const uuid = require('uuid');
const v4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidId(id) {
    return v4Regex.test(id);
}


exports.shuffleArr = function(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
};

exports.generateId = function() {
    return uuid.v4();
};

exports.getIds = function(arrData, idField) {
    var ids = [];

    if (Array.isArray(arrData)) {
        for (let i = 0; i < arrData.length; i++) {
            if (arrData[i][idField] && isValidId(arrData[i][idField])) {
                ids.push(arrData[i][idField]);
            }
        }
    }

    return ids;
};
