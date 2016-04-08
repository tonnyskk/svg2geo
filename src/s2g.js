import S2GFeature from './s2g-feature';
import X2JS from '../x2js/xml2json';

// Static attribute for S2G
export const NodeTypes = {
    Rectangle: "rect",
    Polygon: "polygon",
    Polyline: "path",
    Metadata: "metadata"
};

export default class S2G {
    constructor(options = {}) {
        this.options = options;
        this.initialize();
    }

    initialize() {
        this.x2js = new X2JS({ stripWhitespaces : true, attributePrefix: '' });
    }

    parseSvgText(svgText) {
        let featureList = [];

        if (!svgText) {
            return featureList;
        }

        let svg_object = this.x2js.xml_str2json(svgText);
        if (!svg_object || !svg_object.svg) {
            console.warn('Invalid SVG text.');
            return featureList;
        }

        let svg_data = svg_object.svg;
        let svg_props = this._getSvgProps(svg_data);

        Object.keys(svg_data).map((key, index) => {
            switch (key) {
                case NodeTypes.Rectangle:
                case NodeTypes.Polygon:
                case NodeTypes.Polyline:
                    let feature = new S2GFeature(svg_props);
                    feature.parse(key, svg_data[key]);
                    featureList.push(feature);
                    break;
            }
        });

        return featureList;
    }

    _getSvgProps(svgData) {
        let svgProps = {};
        let svgMetadata = {};
        Object.keys(svgData).map((key, index) => {
            if (key === NodeTypes.Metadata) {
                svgMetadata = Object.assign({}, svgData[key]);
            } else if (svgData[key].constructor == String) {
                // let descriptor = Object.getOwnPropertyDescriptor(svgData, key);
                // Object.defineProperty(svgProps, key, descriptor);
                // svgProps[key] = svgData[key];
                Object.assign(svgProps, { [key]: svgData[key] });
            }
        });

        return { svgProps, svgMetadata };
    }
};
