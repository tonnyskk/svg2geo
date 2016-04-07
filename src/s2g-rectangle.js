import S2GShape from './s2g-shape';

export default class S2GRectangle extends S2GShape {
    constructor(coordinates = []){
        super('Polygon', coordinates);
    }

    parse(svgData) {
        if (!svgData.metadata
            || !svgData.metadata.markup_element
            || !svgData.metadata.markup_element.position
            || !svgData.metadata.markup_element.size) {
            console.warn('Invalid Rectangle svg data!');
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

        coordinates.push([positions[0], positions[1]]);
        coordinates.push([positions[0] + sizes[0], positions[1]]);
        coordinates.push([positions[0] + sizes[0], positions[1] - sizes[1]]);
        coordinates.push([positions[0], positions[1] - sizes[1]]);
        coordinates.push([positions[0], positions[1]]);

        return coordinates;
    }
};
