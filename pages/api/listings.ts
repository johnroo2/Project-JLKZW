import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/utils/connect";
import Listing from "@/models/listingmodel";
import {Formidable} from "formidable";
import { v2 as cloudinary } from "cloudinary";
import enableCors from "@/middleware/cors";

/**
 * Handler for CRUD operations on listings.
 * @param req The Next.js API request object.
 * @param res The Next.js API response object.
 */

export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {

  enableCors(req, res);
  const { method } = req;
  await connectDB();

  switch (method) {
    case 'GET':
      try {
        const response = await Listing.find();
        res.status(200).json({ response });
      } catch (err) {
        console.error("Error:", err);
        res.status(400).json({ message: err });
      }
      break;
    case 'POST':
      const formPost = new Formidable();
    
      formPost.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Error parsing form data:', err);
          return res.status(500).json({ message: 'Error parsing form data' });
        }
    
        const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
        const about = Array.isArray(fields.about) ? fields.about[0] : fields.about;
        let imageUrl; 
  
        if (files.image && Array.isArray(files.image) && files.image.length > 0) {
          try {
            cloudinary.config({
              cloud_name: process.env.CLOUD_NAME,
              api_key: process.env.CLOUDINARY_KEY,
              api_secret: process.env.CLOUDINARY_SECRET
            });
            
            const imageUploadResult = await cloudinary.uploader.upload(files.image[0].filepath);
            imageUrl = imageUploadResult.secure_url;
          } catch (err) {
            console.error('Error uploading image to Cloudinary:', err);
            return res.status(500).json({ message: 'Error uploading image to Cloudinary' });
          }
        }
    
        try {
          const newListingData: { name: string; about: string; image?: string } = 
          { name: name || "", about: about || "" };
          if (imageUrl) {
            newListingData.image = imageUrl;
          }
          
          const newListing = await Listing.create(newListingData);
          res.status(201).json({ newListing });
        } catch (err:any) {
          console.error('Error creating new listing:', err);
          res.status(400).json({ message: err.message });
        }
      });
      break;
    case 'PUT':
      const formPut = new Formidable();
    
      formPut.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Error parsing form data:', err);
          return res.status(500).json({ message: 'Error parsing form data' });
        }
    
        const { id } = fields;
        const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
        const about = Array.isArray(fields.about) ? fields.about[0] : fields.about;
        let imageUrl: string | undefined;
    
        if (files.image && Array.isArray(files.image) && files.image.length > 0) {
          try {
            const imageUploadResult = await cloudinary.uploader.upload(files.image[0].filepath);
            imageUrl = imageUploadResult.secure_url;
          } catch (err) {
            console.error('Error uploading image to Cloudinary:', err);
            return res.status(500).json({ message: 'Error uploading image to Cloudinary' });
          }
        }
    
        try {
          if (!id) {
            throw new Error('ID is required for updating the listing');
          }
    
          const updateData: { name?: string; about?: string; image?: string } = {};
          if (name) {updateData.name = name;}
          if (about) {updateData.about = about;}
          if (imageUrl || files.image) {updateData.image = imageUrl; }
          else{ updateData.image = "" }
    
          const updatedListing = await Listing.findByIdAndUpdate(id, updateData, { new: true });
    
          if (!updatedListing) {
            return res.status(404).json({ message: 'Listing not found' });
          }
    
          res.status(200).json({ updatedListing });
        } catch (err:any) {
          console.error('Error:', err);
          res.status(400).json({ message: err.message });
        }
      });
      break;      
    case 'DELETE':
      const form_del = new Formidable();

      form_del.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error parsing form data:', err);
            return res.status(500).json({ message: 'Error parsing form data' });
        }

        const { id } = fields;
        try {
          await Listing.findByIdAndDelete(id);
          res.status(204).end();
        } catch (err) {
          console.error("Error:", err);
          res.status(400).json({ message: err });
        }
      })
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
