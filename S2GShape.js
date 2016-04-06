(function(Namespace){

    class S2GShape {
        constructor(type, coordinates) {
            this.type = type;
            this.coordinates = [...coordinates];
        }

        parse(svgData) {

        }
    }

    Namespace.S2GShape = S2GShape;
})(Autodesk.BIM360.Convert);
