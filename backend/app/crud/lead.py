from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from app.models.lead import Lead, LeadCreate, LeadUpdate, StageChange
from app.db.database import get_database

class CRUDLead:
    """
    Async CRUD operations for Lead model using MongoDB
    """
    def __init__(self):
        self.db = get_database()
        self.collection = self.db.leads

    def _convert_id(self, lead_data: dict) -> dict:
        """Helper method to convert MongoDB _id to string id"""
        if lead_data and "_id" in lead_data:
            lead_data["id"] = str(lead_data.pop("_id"))
        return lead_data

    async def get(self, lead_id: str) -> Optional[Lead]:
        """Get a single lead by ID"""
        try:
            lead_data = await self.collection.find_one({"_id": ObjectId(lead_id)})
            if lead_data:
                return Lead(**self._convert_id(lead_data))
        except Exception as e:
            print(f"Error fetching lead: {e}")
        return None

    async def get_by_email(self, email: str) -> Optional[Lead]:
        """Get a single lead by email"""
        lead_data = await self.collection.find_one({"email": email})
        if lead_data:
            return Lead(**self._convert_id(lead_data))
        return None

    async def get_multi(
        self,
        skip: int = 0,
        limit: int = 10,
        sort_by: str = "created_at",
        sort_desc: bool = True,
        search: Optional[str] = None
    ) -> List[Lead]:
        """Get multiple leads with simple filtering"""
        filter_query = {}
        if search:
            filter_query = {
                "$or": [
                    {"name": {"$regex": search, "$options": "i"}},
                    {"email": {"$regex": search, "$options": "i"}},
                    {"company": {"$regex": search, "$options": "i"}}
                ]
            }

        # Simple find with sort and limit
        cursor = self.collection.find(filter_query)
        cursor = cursor.sort(sort_by, -1 if sort_desc else 1)
        cursor = cursor.skip(skip).limit(limit)
        
        leads_data = await cursor.to_list(length=limit)
        return [Lead(**self._convert_id(lead)) for lead in leads_data]

    async def create(self, lead_data: LeadCreate) -> Lead:
        """Create a new lead"""
        # Convert the model to dict and add timestamps
        lead_dict = lead_data.dict(exclude_none=True)
        lead_dict.update({
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "stage_updated_at": datetime.utcnow(),
            "stage_history": [{
                "from_stage": None,
                "to_stage": lead_data.current_stage,
                "changed_at": datetime.utcnow()
            }]
        })
        
        # Insert into database
        result = await self.collection.insert_one(lead_dict)
        
        # Fetch the created document
        created_lead = await self.collection.find_one({"_id": result.inserted_id})
        
        # Convert ObjectId to string for the id field
        created_lead["id"] = str(created_lead.pop("_id"))
        
        return Lead(**created_lead)

    async def update(self, id: str, lead_update: LeadUpdate) -> Optional[Lead]:
        """Update an existing lead"""
        update_dict = lead_update.model_dump(exclude_unset=True)
        
        if "current_stage" in update_dict:
            current_lead = await self.get(id)
            if current_lead and current_lead.current_stage != update_dict["current_stage"]:
                stage_change = {
                    "from_stage": current_lead.current_stage,
                    "to_stage": update_dict["current_stage"],
                    "changed_at": datetime.utcnow()
                }
                update_dict["stage_updated_at"] = datetime.utcnow()
                update_dict["stage_history"] = current_lead.stage_history + [stage_change]

        update_dict["updated_at"] = datetime.utcnow()
        
        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(id)},
            {"$set": update_dict},
            return_document=True
        )
        
        if result:
            return Lead.model_validate(result)
        return None

    async def delete(self, lead_id: str) -> Optional[Lead]:
        """Delete a lead"""
        lead_data = await self.collection.find_one_and_delete(
            {"_id": ObjectId(lead_id)}
        )
        if lead_data:
            return Lead(**self._convert_id(lead_data))
        return None

    async def get_count(self, search: Optional[str] = None) -> int:
        """Get total count of leads, optionally filtered by search"""
        filter_query = {}
        if search:
            filter_query = {
                "$or": [
                    {"name": {"$regex": search, "$options": "i"}},
                    {"email": {"$regex": search, "$options": "i"}},
                    {"company": {"$regex": search, "$options": "i"}}
                ]
            }
        return await self.collection.count_documents(filter_query)

# Global instance
lead = CRUDLead() 