import JSZip from 'jszip';
import { pluginFiles } from '../pluginFiles/phpFiles';

export async function generatePluginZip(): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder('wc-bulk-product-editor-pro');

  if (!folder) {
    throw new Error('Failed to create zip folder');
  }

  // Ensure all directories and nested directories are explicitly created in the zip structure
  // This prevents Linux unzip / WordPress PclZip extraction errors where parent directories are missed
  const subdirs = [
    'includes',
    'includes/admin',
    'includes/integrations',
    'assets',
    'assets/css',
    'assets/js',
    'languages',
    'docs'
  ];
  subdirs.forEach(dir => {
    folder.folder(dir);
  });

  // Add all plugin source files and documentation
  pluginFiles.forEach(file => {
    folder.file(file.path, file.content);
  });

  // Add a sample empty languages dir or pot file
  folder.file('languages/wc-bulk-product-editor.pot', `# Translation template for WooCommerce Bulk Product Editor Pro\nmsgid ""\nmsgstr ""\n"Language: fa_IR\\n"`);

  // Generate ZIP blob
  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  return content;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
