/**
 * Wrapper around fetch for conversion POST requests.
 * On 403, dispatches a "zenpdf:limitReached" CustomEvent and returns null.
 * On other errors, throws with the response text.
 * On success, returns the Response.
 */
export async function fetchConvert(url, formData) {
    const response = await fetch(url, { method: "POST", body: formData });

    if (response.status === 403) {
        window.dispatchEvent(new CustomEvent("zenpdf:limitReached"));
        return null;
    }

    // If fetch followed a redirect and landed on an HTML page (unexpected),
    // treat as a limit/access error rather than crashing.
    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok && contentType.includes("text/html")) {
        window.dispatchEvent(new CustomEvent("zenpdf:limitReached"));
        return null;
    }

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Une erreur est survenue.");
    }

    return response;
}

/** Download a blob response as a file. */
export function downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}