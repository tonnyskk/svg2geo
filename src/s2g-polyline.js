import S2GShape from './s2g-shape';

export default class S2GPolyline extends S2GShape {
    constructor(coordinates = []){
        super('LineString', coordinates);
    }

    parse(svgData) {
        let path = svgData.d;
        if (!path || !path.startsWith('M ')) {
            console.warn('Invalid Path svg data!');
            return;
        }

        let markupType = this.getMarupTypeFromSvgData(svgData);
        if (markupType === 'freehand') {
            this._parseFreehandPath(path);
        } else  if (markupType === 'cloud') {
            this._parseCloudPath(path);
        }
    }

    _parseFreehandPath(path) {
        // ******************************************************************************** //
        // http://www.stoimen.com/blog/2011/02/11/from-svg-to-geo-coordinates-a-complete-guide/
        // >> M (absolute) m (relative) – moveto
        // >> L (absolute) l (relative) – lineto (x y)+
        // "M -120.02419354838707 128.02580645161288 L -112.02258064516104 128.02580645161288"
        // ******************************************************************************** //
        let pathDataArray = path.substring(2).split(' L ');

        pathDataArray.map((value, index, pArray) => {
            let subArray = value.split(' ');

            subArray.map((value, index, sArray) => {
                sArray[index] = parseFloat(value, 10);
            });

            pArray[index] = subArray;
        });

        this.coordinates = [...pathDataArray];
    }

    _parseCloudPath(path) {
        // ******************************************************************************** //
        // http://www.stoimen.com/blog/2011/02/11/from-svg-to-geo-coordinates-a-complete-guide/
        // >> Z or z – closepath
        // Close the current subpath by drawing a straight line from the current point to current subpath’s initial point.
        // Since the Z and z commands take no parameters, they have an identical effect.
        //
        // >> C (absolute) c (relative) – curveto (x1 y1 x2 y2 x y)+
        // Draws a cubic Bézier curve from the current point to (x,y) using (x1,y1) as the control point
        // at the beginning of the curve and (x2,y2) as the control point at the end of the curve.
        // C (uppercase) indicates that absolute coordinates will follow; c (lowercase) indicates
        // that relative coordinates will follow. Multiple sets of coordinates may be specified to draw a polybézier.
        // At the end of the command, the new current point becomes the final (x,y) coordinate pair used in the polybézier.
        //
        // M 112.02258064516445,112.02258064516445
        // C 144.02903225806858,16.003225806452065 208.04193548387684,16.003225806452065 240.04838709678097,112.02258064516445
        // C 272.0548387096851,16.003225806452065 336.06774193549336,16.003225806452065 368.0741935483975,112.02258064516445 Z
        // ******************************************************************************** //

        console.warn('Unsupported shape now.');

    }
};
