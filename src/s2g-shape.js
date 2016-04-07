export default class S2GShape {
    constructor(type, coordinates) {
        this.type = type;
        this.coordinates = [...coordinates];
    }

    parse(svgData) {
    }

    getMarupTypeFromSvgData(svgData) {
        if (svgData && svgData.metadata && svgData.metadata.markup_element) {
            return svgData.metadata.markup_element.type;
        }
        return null;
    }
};
