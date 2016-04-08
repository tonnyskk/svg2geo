import S2GShape from './s2g-shape';

export default class S2GRectangle extends S2GShape {
    constructor(coordinates = []) {
        super('Polygon', coordinates);
    }

    parse(svgData) {
        let markupType = this.getMarupTypeFromSvgData(svgData);
        if (!markupType) {
            // Maybe rect for Text label
            return;
        }

        let position = svgData.metadata.markup_element.position;
        let size = svgData.metadata.markup_element.size;

        let positions = position.split(' ');
        positions.map((value, index, array) => {
            array[index] =  parseFloat(value, 10);
        });

        let sizes = size.split(' ')
        sizes.map((value, index, array) => {
            array[index] = parseFloat(value, 10);
        });

        this.coordinates.push(this._generateCoordinates(positions, sizes));
    }

    _generateCoordinates(positions, sizes) {
        let coordinates = [];

        // For real code, we need consider the stroke width and remove it or keep it inside the rectangle area.
        // Following code is including the stroke border in the rectangle area.
        coordinates.push([positions[0] - sizes[0] / 2.0, positions[1] + sizes[1] / 2.0]); // left - top
        coordinates.push([positions[0] + sizes[0] / 2.0, positions[1] + sizes[1] / 2.0]); // right - top
        coordinates.push([positions[0] + sizes[0] / 2.0, positions[1] - sizes[1] / 2.0]); // right - bottom
        coordinates.push([positions[0] - sizes[0] / 2.0, positions[1] - sizes[1] / 2.0]); // left - bottom
        coordinates.push([positions[0] - sizes[0] / 2.0, positions[1] + sizes[1] / 2.0]); // First point

        return coordinates;
    }

};
