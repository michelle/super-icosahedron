gr_shader = {
  uniforms: {
    tDiffuse: {type: "t", value:0, texture:null},
    fX: {type: "f", value: 0.5},
    fY: {type: "f", value: 0.5},
    fExposure: {type: "f", value: 0.6},
    fDecay: {type: "f", value: 0.93},
    fDensity: {type: "f", value: 0.96},
    fWeight: {type: "f", value: 0.4},
    fClamp: {type: "f", value: 1.0}
  },
  vertexShader: $('#vs-godray').text(),
  fragmentShader: $('#fs-godray').text() 
};


