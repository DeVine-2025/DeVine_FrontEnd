import DOMPurify from 'dompurify';

const FEATURE_MARKER = 'devine-project-features';

export function splitProjectFeatures(content: string): { summary: string; features: string[] } {
  const template = document.createElement('template');
  template.content.appendChild(DOMPurify.sanitize(content, {
    RETURN_DOM_FRAGMENT: true,
    ALLOWED_TAGS: [
      'p', 'br', 'div', 'section', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'b', 'em', 'i', 'u', 's', 'del', 'strike', 'blockquote',
      'ul', 'ol', 'li', 'pre', 'code', 'hr', 'a', 'img',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title', 'width', 'height',
      'start', 'data-section', 'data-type',
    ],
    ALLOW_DATA_ATTR: false,
  }));

  const section = template.content.querySelector(`section[data-section="${FEATURE_MARKER}"]`);
  const features = section
    ? Array.from(section.querySelectorAll('li'), item => item.textContent?.trim() ?? '').filter(Boolean)
    : [];
  section?.remove();

  for (const link of template.content.querySelectorAll<HTMLAnchorElement>('a[target]')) {
    if (link.target.toLowerCase() === '_blank') link.rel = 'noopener noreferrer';
  }
  return { summary: template.innerHTML, features };
}

export function joinProjectFeatures(summary: string, features: string[]): string {
  const values = features.map(feature => feature.trim()).filter(Boolean);
  if (!values.length) return summary;
  const document = new DOMParser().parseFromString('', 'text/html');
  const section = document.createElement('section');
  section.dataset.section = FEATURE_MARKER;
  const list = document.createElement('ul');
  values.forEach(value => {
    const item = document.createElement('li');
    item.textContent = value;
    list.appendChild(item);
  });
  section.appendChild(list);
  return summary + section.outerHTML;
}
