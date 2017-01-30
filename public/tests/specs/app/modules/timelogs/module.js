define(['TimeLogs.Model', 'TimeLogs.Collection', 'Customers.Model', 'Customers.Collection', 'Projects.Model', 'Projects.Collection', 'Bootstrap', 'jasmineTypeCheck', 'Application'],
    function (TLModel, TLCollection, CstModel, CstCollection, PrjModel, PrjCollection) {
        'use strict';
        describe('TimeLogs module', function () {

            it('#1 TimeLogs.Model url should be equal to /api/timelogs/:id', function () {
                var tl1 = new TLModel({_id: '123'});
                expect(tl1.url()).toBe('/api/timelogs/123');
            });
        });

    });