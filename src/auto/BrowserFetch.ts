export class BrowserFetch {
    execAction(url: string): Promise<any>  {
        return this.get();
    }

    get(): Promise<any> {
        return fetch("/", {
            method: "get",
            headers: {
                "Accept": "application/x-www-form-urlencoded",
                "Content-Type": "application/json"
            }
        });
    }

    postForm(): Promise<any> {
        return fetch("/", {
            method: "post",
            body: new FormData(),
            headers: {
                "Accept": "application/x-www-form-urlencoded",
                "Content-Type": "application/json"
            }
        });
    }

    postJson(): Promise<any> {
        return fetch("/", {
            method: "post",
            body: JSON.stringify({}),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });
    }
}