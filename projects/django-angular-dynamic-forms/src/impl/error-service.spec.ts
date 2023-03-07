import { async, TestBed } from "@angular/core/testing";

import { ErrorService } from "./error-service";

describe("ErrorService", () => {
    let es: ErrorService;
    // Asynchronous beforeEach.
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [ErrorService],
        })
            .compileComponents()
            .then(() => {
                /* Don't do anything */
            });
    }));

    // Synchronous BeforeEach.
    beforeEach(() => {
        es = TestBed.get(ErrorService);
    });

    it("should display error message", (done) => {
        es.showError("expected error message");
        done();
    });
});
