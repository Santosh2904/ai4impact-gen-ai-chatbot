import {
  BreadcrumbGroup,
  ContentLayout,
  Header,
  SpaceBetween,
  Modal,
} from "@cloudscape-design/components";
import {
  Authenticator,
  Heading,
  useTheme,
} from "@aws-amplify/ui-react";
import BaseAppLayout from "../../components/base-app-layout";
import useOnFollow from "../../common/hooks/use-on-follow";
import DataFileUpload from "./data-file-upload";
import { CHATBOT_NAME } from "../../common/constants";
import { S3 } from 'aws-sdk';
import { useState } from 'react';
import { message } from 'antd';

const s3 = new S3(); 

const uploadDocument = async (folder, file) => { 
  const params = {
    Bucket: 'your-bucket-name',
    Key: `${folder}/${file.name}`, // Include folder in the file path
    Body: file,
  };
  await s3.upload(params).promise();
};

// const showMessage = (type, content) => { 
//   Modal.open({
//     header: type === 'success' ? 'Success' : 'Error',
//     content,
//     closeAriaLabel: 'Close',
//   });
// };

export default function AddData() {
  const onFollow = useOnFollow();
  const { tokens } = useTheme();
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [file, setFile] = useState(null);

  const handleUpload = async () => { 
    if (!selectedFolder || !file) { // Ensure folder and file are selected
      message.error('Please select a folder and a file');
      return;
    }
    try {
      await uploadDocument(selectedFolder, file); // Pass folder to upload function
      message.success('File uploaded successfully');
    } catch (error) {
      message.error('Failed to upload file');
    }
  };
  
  return (
    <Authenticator hideSignUp={true}
    components={{
      SignIn: {
        Header: () => {
          return (
            <Heading
              padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
              level={3}
            >
              {CHATBOT_NAME}
            </Heading>
          );
        },
      },
    }}>
    <BaseAppLayout
      contentType="cards"
      breadcrumbs={
        <BreadcrumbGroup
          onFollow={onFollow}
          items={[
            {
              text: CHATBOT_NAME,
              href: "/",
            },

            {
              text: "Add Data",
              href: "/admin/add-data",
            },
          ]}
        />
      }
      content={
        <ContentLayout header={<Header variant="h1">Add Data</Header>}>
          <SpaceBetween size="l">
                        <DataFileUpload                                           
                      />
          </SpaceBetween>
        </ContentLayout>
      }
    />
    </Authenticator>
  );
}
