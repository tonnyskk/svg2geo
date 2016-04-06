(function(){
    function S2GRectangle(coordinates){
        S2GShape.call(this, 'Polygon', coordinates);
    }

    var proto = S2GRectangle.prototype;

    proto.parse = function(svgData) {
        let position = svgData.metadata.markup_element._position;
        let size = svgData.metadata.markup_element._size;

        let positions = position.split(' ');
        let sizes = position.split(' ');

        this.coordinates.push(this._generateCoordinates(positions, sizes));
    };

    proto._generateCoordinates = function(positions, sizes) {
        let coordinates = [];

        coordinates.push([positions[0], positions[1]]);
        coordinates.push([positions[0] + sizes[0], positions[1]]);
        coordinates.push([positions[0] + sizes[0], positions[1] - sizes[1]]);
        coordinates.push([positions[0], positions[1] - sizes[1]]);
        coordinates.push([positions[0], positions[1]]);

        return coordinates;
    };
})();
