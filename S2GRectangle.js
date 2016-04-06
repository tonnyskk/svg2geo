(function(Namespace){

    class S2GRectangle extends Namespace.S2GShape {
        constructor(coordinates){
            super('Polygon', coordinates || []);
        }

        parse(svgData) {
            let position = svgData.metadata.markup_element._position;
            let size = svgData.metadata.markup_element._size;

            let positions = position.split(' ');
            positions.forEach(function(value, index, array) {
                array[index] =  parseFloat(value, 10);
            });

            let sizes = size.split(' ')
            sizes.map(function(value, index, array) {
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
    }

    Namespace.S2GRectangle = S2GRectangle;
})(Autodesk.BIM360.Convert);
