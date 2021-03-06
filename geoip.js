var fs        = require('fs'),
path      = require('path'),
buf2long  = require('./lib/utils.js').buf2long,
CONST     = require('./include/constants.js'),
DATA = require('./include/models.js').DATA;

/******************************************************************************
 * Inner Functions
 *****************************************************************************/

 function _setup_segments(data) {
   var offset;
   data.db_type = CONST.COUNTRY_EDITION;
   data.record_length = CONST.STANDARD_RECORD_LENGTH;
   var buf = data.buffer;
   offset = buf.length - 3;
   for (var i = 0; i < CONST.STRUCTURE_INFO_MAX_SIZE; i++) {
     var delim = buf2long(buf.slice(offset, offset + 3));
     offset += 3;
     if (delim === CONST.DELIMETER_NUMBER) {
       data.db_type = parseInt(buf[offset], 10);
       offset++;
       if (data.db_type === CONST.REGION_EDITION_REV0) {
         data.db_segments = CONST.STATE_BEGIN_REV0;
       } else if (data.db_type === CONST.REGION_EDITION_REV1) {
         data.db_segments = CONST.STATE_BEGIN_REV1;
       } else if (data.db_type === CONST.CITY_EDITION_REV0 ||
       data.db_type === CONST.CITY_EDITION_REV1 ||
       data.db_type === CONST.ORG_EDITION  ||
       data.db_type === CONST.DOMAIN_EDITION ||
       data.db_type === CONST.ISP_EDITION    ||
       data.db_type === CONST.LOCATIONA_EDITION   ||
       data.db_type === CONST.ACCURACYRADIUS_EDITION ||
       data.db_type === CONST.ASNUM_EDITION
     ) {
       data.db_segments = 0;
       var seg = buf.slice(offset, offset + CONST.SEGMENT_RECORD_LENGTH);
       for (var j = 0; j < CONST.SEGMENT_RECORD_LENGTH; j++) {
         data.db_segments += (parseInt(seg[j], 10) << (j * 8));
       }
       if (data.db_type === CONST.ORG_EDITION ||
       data.db_type === CONST.DOMAIN_EDITION ||
       data.db_type === CONST.ISP_EDITION
     ) {
       data.record_length = CONST.ORG_RECORD_LENGTH;
     }
   }
   break;
 } else {
   offset -= 4;
 }
   }

   if (data.db_type === CONST.COUNTRY_EDITION ||
   data.db_type === CONST.PROXY_EDITION   ||
   data.db_type === CONST.NETSPEED_EDITION) {
     data.db_segments = CONST.COUNTRY_BEGIN;
   }

   return data;
 }


 /******************************************************************************
  * Exprots Functions
  *****************************************************************************/
  exports.open = function(file) {
    var stats, bytesRead;
    var data = new DATA();
    data.file_descriptor = fs.openSync(file, 'r');
    stats = fs.fstatSync(data.file_descriptor);
    data.buffer = new Buffer(stats.size);
    bytesRead = fs.readSync(data.file_descriptor, data.buffer, 0, stats.size, 0);

    if (bytesRead >= 0) {
      return _setup_segments(data);
    } else {
      return false;
    }

  };

  exports.close = function(data) {
    return fs.close(data.file_descriptor);
  };


  exports.NetSpeed = require('./lib/netspeed.js');
  exports.Country = require('./lib/country.js');
  exports.Region  = require('./lib/region.js');
  exports.City    = require('./lib/city.js');
  exports.Org     = require('./lib/org.js');
