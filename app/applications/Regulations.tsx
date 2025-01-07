import { getRegulationById, putRegulation } from "@/service/RegulationService";
import {
  Card,
  ScrollView,
  VStack,
  Button,
  HStack,
  Input,
} from "@gluestack-ui/themed";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Regulation } from "@/model/Regulation";
import moment from "moment-timezone";
import dynamic from "next/dynamic";
import { marked } from "marked";

/* Id and title are not used now, for future updates */

const MdEditor = dynamic(() => import("react-markdown-editor-lite"), { ssr: false });
import "react-markdown-editor-lite/lib/index.css";

export default function RegulationDetail() {
  const params = useLocalSearchParams();
  const [regulation, setRegulation] = useState<Regulation>({
    id: 0,
    title: "Loading...", 
    content: "Loading...",
    modifiedTime: new Date(),
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.roles === "Manager") {
      setIsManager(true);
    }

    const id = params.regulationId ? parseInt(params.regulationId as string, 10) : 0;

    getRegulationById(id)
      .then((data) => {
        setRegulation({
          ...data,
          modifiedTime: data.modifiedTime ? new Date(data.modifiedTime) : new Date(),
        });
        setEditedTitle(data.title || ""); 
        setEditedContent(data.content || "");
      })
      .catch((error) => {
        console.error(error.message);
        setRegulation({
          id: 0,
          title: "Error",
          content: "Failed to load regulation content.",
          modifiedTime: new Date(),
        });
      });
  }, [params.regulationId]);

  const handleSave = () => {
    const updatedRegulation = {
      id: regulation.id,
      title: editedTitle, 
      content: editedContent,
      modifiedTime: moment().toDate(),
    };

    putRegulation(regulation.id, updatedRegulation)
      .then(() => {
        setRegulation({ ...updatedRegulation });
        setIsEditing(false);
      })
      .catch((error) => {
        console.error("Failed to update regulation:", error.message);
      });
  };

  return (
    <ScrollView>
      <Card margin={3}>
        {isEditing ? (
          <>
            {/* for title in future */}
            <MdEditor
              style={{ height: "600px" }}
              value={editedContent}
              renderHTML={(text) => (
                <div dangerouslySetInnerHTML={{ __html: marked(text) }} />
              )}
              onChange={({ text }) => setEditedContent(text)}
            />
          </>
        ) : (
          <VStack>
            {/* for title in future */}
            <div
              dangerouslySetInnerHTML={{
                __html: marked(regulation.content || ""),
              }}
            />
          </VStack>
        )}

        <HStack justifyContent="flex-end" marginTop={10}>
          {isEditing ? (
            <Button onPress={handleSave}>Save</Button>
          ) : (
            isManager && <Button onPress={() => setIsEditing(true)}>Modify</Button>
          )}
        </HStack>
      </Card>
    </ScrollView>
  );
}
