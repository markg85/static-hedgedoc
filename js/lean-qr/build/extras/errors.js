"use strict";const e={1:"No data",2:"Bad version range",3:"Bad error correction range",4:"Too much data",5:"Data cannot be encoded using requested modes",6:"Bad framework",7:"Bad generate function",8:"Bad toSvgDataURL function"};exports.readError=o=>"object"!=typeof o?`${o}`||"Unknown error":e[o.code]||o.message||"Unknown error";