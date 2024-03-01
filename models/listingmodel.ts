import { Schema, model, models, Document } from "mongoose";

interface ListingModel extends Document {
  name: string;
  about: string;
  image?: string;
}

const listingSchema = new Schema<ListingModel>(
  {
    name: {
      type: String,
      required: true
    },
    about: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true
  }
);

const Listing = models.Listing || model<ListingModel>("Listing", listingSchema);

export default Listing;
