describe('Verify An ePub file', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:8080', {waitUntil: 'networkidle2'});
  });

  it('should have table of contents', async (done) => {
    // assertion 1: 
    var isTocPresentInResources = await page.evaluate(async () => {
      var links = await ReadiumNGViewer.navigator.pub.resources;
      return links.some((link) => {
        if (link.rel) {
          return link.rel.has("contents");
        }
      });
    });

    // assertion 2: check pub.toc
    var hasTocPubElement = await page.evaluate(async () => {
      var links = await ReadiumNGViewer.navigator.pub.toc;
      return Array.isArray(links) && links.length !== 0;
    });

    var hasToc = isTocPresentInResources && hasTocPubElement;
    expect(hasToc).toBeTruthy();
    done();
  });

  it('should have cover page', async () => {
    var hasCover = await page.evaluate(async () => {
      var links = await ReadiumNGViewer.navigator.pub.resources;
      return links.some((link) => {
        if (link.rel) {
          return link.rel.has("cover");
        }
      });
    });
    expect(hasCover).toBeTruthy();
  });

  it('should open properly', async (done) => {
    // assertion 1: verify that reader opens on first page of reading order
    var currLocHref = await page.evaluate(async () => {
      var currLocation = await ReadiumNGViewer.navigator.getCurrentLocation();
      return currLocation.href;
    });
    var firstReadingOrderHref = await page.evaluate(async () => {
      return await ReadiumNGViewer.navigator.pub.readingOrder[0].href;
    });
    expect(currLocHref).toMatch(firstReadingOrderHref);

    // assertion 2: verify that html in reader matches what is expected
    var mainFrame = await page.mainFrame();
    var subframes = await mainFrame.childFrames();
    var iframeBodyContent = await subframes[0].$eval('body', (element) => {
      return element.outerHTML;
    });

    var expectedBodyContent = await page.evaluate(async () => {
      var pub = ReadiumNGViewer.navigator.pub;
      var firstPageURL = new URL(pub.readingOrder[0].href, pub.sourceURI).toString();
      var response = await fetch(firstPageURL);
      var data = await response.text();
      var doc = new DOMParser().parseFromString(data, "text/xml");

      return doc.body.outerHTML;
    });

    expect(iframeBodyContent).toMatch(expectedBodyContent);
    done();
  });
});