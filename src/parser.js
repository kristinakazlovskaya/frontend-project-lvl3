const parseRss = (str) => new window.DOMParser().parseFromString(str, 'text/xml');

export default parseRss;
