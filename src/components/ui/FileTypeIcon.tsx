import { FaRegFilePdf, FaRegFileWord, FaRegFileExcel, FaRegFilePowerpoint, FaRegFileImage, FaRegFileVideo, FaRegFileAudio, FaRegFileArchive, FaRegFileCode, FaRegFileAlt, FaRegFile } from 'react-icons/fa';
import { SiJavascript, SiTypescript, SiHtml5, SiCss3, SiJson, SiMarkdown } from 'react-icons/si';
import { BsFiletypeSql, BsFiletypeXml, BsFiletypePy, BsFiletypeJava, BsFiletypePhp, BsFiletypeTxt } from 'react-icons/bs';

  
  
const FileTypeIcon = ({ mimeType, filename, className = "w-5 h-5 text-blue-600" }: { 
mimeType?: string; 
filename?: string;
className?: string;
}) => {
const extension = filename?.split('.').pop()?.toLowerCase();
const fileType = mimeType?.split('/')[0];
const subType = mimeType?.split('/')[1];

// Image files
if (fileType === 'image') return <FaRegFileImage className={className} />;

// Video files
if (fileType === 'video') return <FaRegFileVideo className={className} />;

// Audio files
if (fileType === 'audio') return <FaRegFileAudio className={className} />;

// PDF files
if (subType === 'pdf' || extension === 'pdf') return <FaRegFilePdf className={className} />;

// Document files (Word, etc.)
if (subType?.includes('word') || 
    ['doc', 'docx'].includes(extension || '')) {
    return <FaRegFileWord className={className} />;
}

// Spreadsheet files (Excel, etc.)
if (subType?.includes('excel') || subType?.includes('spreadsheet') || 
    ['xls', 'xlsx', 'csv'].includes(extension || '')) {
    return <FaRegFileExcel className={className} />;
}

// Presentation files (PowerPoint, etc.)
if (subType?.includes('powerpoint') || subType?.includes('presentation') || 
    ['ppt', 'pptx'].includes(extension || '')) {
    return <FaRegFilePowerpoint className={className} />;
}

// Archive files
if (subType?.includes('zip') || subType?.includes('rar') || 
    ['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
    return <FaRegFileArchive className={className} />;
}

// Code files with specific icons
if (extension === 'js' || subType === 'javascript') return <SiJavascript className={className} />;
if (extension === 'ts' || subType === 'typescript') return <SiTypescript className={className} />;
if (extension === 'html') return <SiHtml5 className={className} />;
if (extension === 'css') return <SiCss3 className={className} />;
if (extension === 'json') return <SiJson className={className} />;
if (extension === 'md' || extension === 'markdown') return <SiMarkdown className={className} />;
if (extension === 'sql') return <BsFiletypeSql className={className} />;
if (extension === 'xml') return <BsFiletypeXml className={className} />;
if (extension === 'py') return <BsFiletypePy className={className} />;
if (extension === 'java') return <BsFiletypeJava className={className} />;
if (extension === 'php') return <BsFiletypePhp className={className} />;

// Text files
if (fileType === 'text' || ['txt', 'rtf'].includes(extension || '')) {
    return <BsFiletypeTxt className={className} />;
}

// Generic code files
if (['jsx', 'tsx', 'c', 'cpp', 'h', 'hpp', 'rb', 'go', 'rs', 'swift', 'kt'].includes(extension || '')) {
    return <FaRegFileCode className={className} />;
}

// Default file icons based on type
if (fileType === 'text') return <FaRegFileAlt className={className} />;
if (fileType === 'application') return <FaRegFile className={className} />;

// Ultimate fallback
return <FaRegFile className={className} />;
};
export default FileTypeIcon;