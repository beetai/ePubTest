describe('Verify An ePub file', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:8080', {waitUntil: 'networkidle2'});
  });

  it('should have page list', async () => {
    var hasPageList = await page.evaluate(async () => {
      var pages = await ReadiumNGViewer.navigator.pub.pageList;
      return Array.isArray(pages) && pages.length !== 0;
    });

    expect(hasPageList).toBeTruthy();
  });
});