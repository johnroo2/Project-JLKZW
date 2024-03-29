import { Button, Card, Col, Modal, Row, Typography, Form, Input, Upload, message, Spin, Image } from "antd";
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from "react";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import axios from "axios";
import { useWindowSize } from "@uidotdev/usehooks";

const {Title} = Typography
const {Item} = Form
const {TextArea} = Input

export default function Index() {
  const [open, setOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [focus, setFocus] = useState<{name:String, about:String, image:String} | null>(null);
  const [focusId, setFocusId] = useState<null | string>(null);
  const [existingFileList, setExistingFileList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);
  const [form] = useForm();

  const {width} = useWindowSize()

  useEffect(() => {
    form.resetFields();
  }, [form, open])

  useEffect(() => {
    form.setFieldsValue(focus)
    if (editing && focus && focus.image) {
      const existingImage = {
        uid: '-1', 
        name: 'image', 
        status: 'done', 
        url: focus.image
      };
      setExistingFileList([existingImage]); 
    } else {
      setExistingFileList([]); 
    }
    return () => {};
  }, [form, focus])

  useEffect(() => {
    fetch();
  }, [])

  const fetch = async() => {
    setLoading(true)
    try{
      const res = await axios.get("/api/listings")
      setData(res.data.response)
    }
    catch(err){
      console.error(err)
    }
    setTimeout(() => {setLoading(false)}, 500)
  }

  const handleSubmit = async (formValues: any) => {
    setModalLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', formValues.name);
      formData.append('about', formValues.about);

      if (existingFileList && existingFileList[0]) {
        formData.append('image', existingFileList[0].originFileObj);
      }

      const res = await axios.post("/api/listings", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000
      });
      message.success(`Successfully created: ${formValues.name}`);
    } catch (err) {
      message.error(`Failed to submit: ${formValues.name}`);
      console.error(err);
    }
    finally{
      setOpen(false);
      setEditing(false);
      setFocus(null);
      setFocusId(null);
      setExistingFileList([]);
      setModalLoading(false)
      fetch();
    }
  };

  const handleEdit = async (formvalues: any) => {
    setModalLoading(true)
    try {
      const formData = new FormData();
      formData.append('name', formvalues.name);
      formData.append('about', formvalues.about);

      if (existingFileList && existingFileList[0]) {
        formData.append('image', existingFileList[0].originFileObj);
      }

      formData.append('id', focusId as string)

      const res = await axios.put(`/api/listings/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000
      });
      message.success(`Successfully modified: ${formvalues.name}`);
    }
    catch (err) {
      message.error(`Failed to modify: ${formvalues.name}`);
      console.log(err); 
    }
    finally{
      setOpen(false);
      setEditing(false);
      setFocus(null);
      setFocusId(null);
      setExistingFileList([]);
      setModalLoading(false)
      fetch();
    }
  };

  const handleDelete = async(id:any, title:string) => {
    try{
      const res = await axios.delete("/api/listings", { data: { id }, timeout: 30000});
      message.success(`Successfully deleted: ${title}`)
    }
    catch(err){
      message.error(`Failed to delete: ${title}`)
      console.log(err)
    }
    fetch();
  }

  const isLarge = () => !width || width >= 1024

  return (
    <>
    <div className="fixed top-0 left-0 w-screen h-screen dots"/>
    <div className="overflow-hidden flex mx-[5vw] lg:mx-[10vw] 2xl:mx-[15vw] h-[90vh] mt-[5vh]" data-aos="fade-down">
      <Card className="w-full h-full">
        <div className="grid"
        style={{
          gridTemplateRows: isLarge() ? "5rem calc(90vh - 8rem)" : "7.5rem calc(90vh - 10.5rem)"
        }}>
          <div>
            <Title level={isLarge() ? 3 : 2} className="flex flex-col gap-2 lg:gap-0 lg:flex-row items-center justify-between w-full bg-neutral-100 p-3 rounded">
              Dashboard
              <Button type="primary" className="bg-sky-600 px-8" size={isLarge() ? "large" : "middle"}
              onClick={() => {
                setOpen(true)
              }}>
                + New Listing
              </Button>
            </Title>
          </div>
          <div className="w-full h-full overflow-y-scroll overflow-x-hidden">
            {loading ? 
            <div className="flex flex-col gap-4 items-center justify-center h-full">
              <Spin size="large"/>
              Loading...
            </div>
            :
            <div className="flex flex-col gap-4">
              {data.map((item:any, index:number) => {
                return(
                  <Card key={index} className="border-neutral-500 shadow-md bg-neutral-50">
                    <Title level={4} className="flex flex-row items-center justify-between">
                        {item.name}
                        <div className="flex flex-row gap-2 items-center">
                          <Button className="bg-sky-500" type="primary" size="small"
                          onClick={() => {
                            setOpen(true)
                            setEditing(true)
                            setFocus(item)
                            setFocusId(item._id)
                            setExistingFileList([]);
                          }}>
                            <AiFillEdit/>
                          </Button>
                          <Button className="text-red-500" type="primary" danger size="small"
                          onClick={() => {
                            handleDelete(item._id, item.name)
                          }}>
                            <AiFillDelete/>
                          </Button>
                        </div>
                    </Title>
                    <Row gutter={[40, 12]}>
                      <Col span={isLarge() ? (item.image ? 16 : 24) : 24}>
                        {item.about}
                      </Col>
                      {item.image && 
                      <Col span={isLarge() ? 8 : 24} className="flex items-center justify-center">
                        <Image src={item.image} className="w-full h-auto"/>
                      </Col>}
                    </Row>
                  </Card>
                )
              })}
            </div>}
          </div>
        </div>
      </Card>
    </div>

    <Modal width={800} open={open} onCancel={() => {
      setOpen(false);
      setEditing(false);
      setFocus(null);
      setFocusId(null);
      setExistingFileList([]);
    }} footer={null}>
      <Col className="p-3">
        <Title level={3}>
          {editing ? "Modify" : "Create New"} Listing
        </Title>
        {modalLoading ? 
        <div className="flex flex-col gap-4 items-center justify-center h-full">
          <Spin size="large"/>
          Uploading...
        </div>
        :
        <Form form={form} layout="vertical" onFinish={editing ? handleEdit : handleSubmit}>
          <Row gutter={[0, 0]}>
            <Col span={24}>
              <Item label="Name" name="name" rules={[{ required: true, message: 'Please fill in this field' }]}>
                <Input placeholder="Name" />
              </Item>
            </Col>
            <Col span={24}>
              <Item label="About" name="about" rules={[{ required: true, message: 'Please fill in this field' }]}>
                <TextArea showCount placeholder="About" maxLength={400}/>
              </Item>
            </Col>
            <Col span={24}>
              <Item name="image" label="Image"> 
                <Upload name="file" maxCount={1} fileList={existingFileList} action="/api/no-op"
                onChange={(info) => {
                  setExistingFileList([...info.fileList]);
                }}>
                  <Button>Click to Upload</Button>
                </Upload>
              </Item>
            </Col>
            <Button type="primary" className="bg-sky-600 px-8" htmlType="submit">
              {editing ? "Modify" : "Create"} Listing
            </Button>
          </Row>
        </Form>}
      </Col>
    </Modal> 
    </>
  );
}
