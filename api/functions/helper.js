import dotenv from "dotenv";
dotenv.config();
import { Octokit } from '@octokit/rest';
import fs from 'fs';
import axios from 'axios';
import fetch from 'node-fetch'
import * as xlsx from 'xlsx';
const token = process.env.GITHUB_TOKEN;
const octokit = new Octokit({
    auth: token,
    request:{
        fetch:fetch
    }
});
const owner = 'AyushMathpal';
const repo = 'emscdn';
const branch = 'main';


async function uploadSheet(file, name) {
    try {
        const fileContent = Buffer.from(file.buffer).toString('base64');
        const response = await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: 'files/' + name, // Replace with the desired path in your repository
            message: 'Upload file', // Commit message
            content: fileContent, // Convert content to base64
            branch,
        });
        console.log('File uploaded successfully');
    } catch (error) {
        console.error('Error uploading file:', error.message);
    }
}


async function deleteSheet(sheetName) {
    try {
        const existingFile = await octokit.repos.getContent({
            owner,
            repo,
            path: 'files/' + sheetName, // Adjust the path based on your repository structure
            ref: branch,
        });
        const response = await octokit.repos.deleteFile({
            owner,
            repo,
            path: 'files/' + sheetName,
            message: 'Delete file', // Commit message
            sha: existingFile.data.sha, // SHA of the existing file
            branch,
        });

        console.log('File deleted successfully');
    } catch (error) {
        console.error('Error deleting file:', error.message);
    }
}


async function fetchSheet(link) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/files/${link}`;
    try {
        const response = await axios.get(url);
        const base64Content = response.data.content;
        const fileBuffer = Buffer.from(base64Content, 'base64');
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        return sheetData
    } catch (error) {
        console.error('Error fetching sheet:', error.message);
        throw error;
    }
}
export {uploadSheet, fetchSheet, deleteSheet}