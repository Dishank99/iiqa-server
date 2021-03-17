exports.processImageSetsLinksForAPI = function (imageLinks) {
    let resp = "['";
    for (let i = 0; i < imageLinks.length - 1; i++) {
      resp += imageLinks[i] + "', '";
    }
    resp += imageLinks[imageLinks.length - 1] + "']";
    return resp;
  }