// (C) 2021-2022 GoodData Corporation
import fs from "fs";

import axios from "axios";
import waitOn from "wait-on";

export async function wiremockWait(wiremockHost) {
    return waitOn({ resources: [`http-get://${wiremockHost}/__admin`], interval: 2000 });
}

export async function wiremockSettings(wiremockHost) {
    await axios.post(`http://${wiremockHost}/__admin/settings`, {
        fixedDelay: 300,
    });
}

export async function wiremockStartRecording(wiremockHost, appHost) {
    return axios.post(`http://${wiremockHost}/__admin/mappings`, {
        request: {
            method: "ANY",
            urlPattern: ".*",
        },
        response: {
            proxyBaseUrl: `${appHost}`,
        },
    });
}

export async function wiremockStopRecording(wiremockHost) {
    const commonSnapshotParams = {
        captureHeaders: {
            "X-GDC-TEST-NAME": {},
        },
        requestBodyPattern: {
            matcher: "equalToJson",
            ignoreArrayOrder: false,
            ignoreExtraElements: false,
        },
    };

    // persist execution results requests with scenarios
    const responseScenarios = await axios.post(`http://${wiremockHost}/__admin/recordings/snapshot`, {
        repeatsAsScenarios: true,
        filters: {
            urlPattern: ".*executionResults.*",
        },
        persist: false,
        ...commonSnapshotParams,
    });

    // persist other requests without scenarios
    const responsePlain = await axios.post(`http://${wiremockHost}/__admin/recordings/snapshot`, {
        repeatsAsScenarios: false,
        filters: {
            urlPattern: "((?!executionResults).)*",
        },
        persist: false,
        ...commonSnapshotParams,
    });

    return [...responsePlain.data.mappings, ...responseScenarios.data.mappings];
}

export async function wiremockMockLogRequests(wiremockHost) {
    return axios.post(`http://${wiremockHost}/__admin/mappings`, {
        request: {
            method: "POST",
            urlPattern: "/gdc/app/projects/.*/log",
        },
        response: {
            body: "",
            status: 200,
        },
    });
}

export async function wiremockImportMappings(wiremockHost, mappingsFile) {
    let mappings;
    try {
        mappings = fs.readFileSync(mappingsFile);
    } catch (e) {
        process.stderr.write(`mappings file not found: ${mappingsFile}\n`);
        return;
    }
    let json = "";
    try {
        json = JSON.parse(mappings);
    } catch (e) {
        process.stderr.write(`mappings error: ${mappings}\n`);
        return;
    }

    const importReq = await axios.post(`http://${wiremockHost}/__admin/mappings/import`, json);
    process.stdout.write(
        `Wiremock mappings imported from file ${mappingsFile} (status: ${importReq.status}) \n`,
    );
}

export async function wiremockExportMappings(filename, mappings) {
    fs.writeFileSync(
        filename,
        JSON.stringify(
            {
                mappings,
            },
            null,
            2,
        ) + "\n",
    );
}

export async function wiremockReset(wiremockHost) {
    const cleanupReq = await axios.post(`http://${wiremockHost}/__admin/reset`);
    process.stdout.write(`Wiremock mappings cleaned (status: ${cleanupReq.status}) \n`);
}
