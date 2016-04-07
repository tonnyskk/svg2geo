import S2GShape from './s2g-shape';

export default class S2GPolygon extends S2GShape {
    constructor(coordinates = []){
        super('Polygon', coordinates);
    }

    parse(svgData) {
        let markupType = this.getMarupTypeFromSvgData(svgData);
        if (!markupType || markupType !== 'arrow') {
            return;
        }

        // points="0,16.003225806452065 1636.2440093676214,48.009677419356194 0,48.009677419356194"
        let pointPairs = svgData.points.split(' ');
        pointPairs.map((value, index, pArray) => {
            let pointArray = value.split(',');

            pointArray.map((value, index, sArray) => {
                sArray[index] = parseFloat(value, 10);
            });

            pArray[index] = pointArray;
        });

        this.coordinates.push(pointPairs);
    }
};
