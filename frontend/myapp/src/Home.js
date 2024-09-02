import React, { useState, useEffect, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Clear from '@mui/icons-material/Clear';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import image from './bg.png';

// Define styled components
const ColorButton = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText(theme.palette.background.paper),
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: '#ffffff7a',
  },
}));

const MainContainer = styled(Container)({
  backgroundImage: `url(${image})`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  height: '93vh',
  marginTop: '8px',
  padding: 0,
});

const CustomCard = styled(Card)(({ theme }) => ({
  margin: 'auto',
  maxWidth: 400,
  height: 500,
  backgroundColor: 'transparent',
  boxShadow: '0px 9px 70px 0px rgba(0, 0, 0, 0.3) !important',
  borderRadius: '15px',
}));

const Loader = styled(CircularProgress)({
  color: '#be6a77 !important',
});

const AppBarStyled = styled(AppBar)({
  background: '#be6a77',
  boxShadow: 'none',
  color: 'white',
});

const TableContainerStyled = styled(TableContainer)({
  backgroundColor: 'transparent !important',
  boxShadow: 'none !important',
});

const TableStyled = styled(Table)({
  backgroundColor: 'transparent !important',
});

const TableHeadStyled = styled(TableHead)({
  backgroundColor: 'transparent !important',
});

const TableRowStyled = styled(TableRow)({
  backgroundColor: 'transparent !important',
});

const TableCellStyled = styled(TableCell)(({ theme }) => ({
  fontSize: '22px',
  backgroundColor: 'white',
  borderColor: 'transparent !important',
  color: '#000000a6 !important',
  fontWeight: 'bolder',
  padding: '1px 24px 1px 16px',
}));

const TableCellStyled1 = styled(TableCell)(({ theme }) => ({
  fontSize: '14px',
  backgroundColor: 'white',
  borderColor: 'transparent !important',
  color: '#000000a6 !important',
  fontWeight: 'bolder',
  padding: '1px 24px 1px 16px',
}));

export const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [data, setData] = useState(null);
  const [image, setImage] = useState(false);
  const [isLoading, setIsloading] = useState(false);
  let confidence = 0;

  const sendFile = useCallback(async () => {
    if (image && selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const res = await axios.post('http://localhost:8000/predict', formData);
        if (res.status === 200) {
          setData(res.data);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setIsloading(false);
      }
    }
  }, [image, selectedFile]);

  const clearData = () => {
    setData(null);
    setImage(false);
    setSelectedFile(null);
    setPreview(null);
  };

  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    if (preview) {
      setIsloading(true);
      sendFile();
    }
  }, [preview, sendFile]);

  const { getRootProps, getInputProps } = useDropzone({
    acceptedFiles: ['image/*'],
    onDrop: (files) => {
      if (!files || files.length === 0) {
        setSelectedFile(null);
        setImage(false);
        setData(null);
        return;
      }
      setSelectedFile(files[0]);
      setData(null);
      setImage(true);
    },
  });

  if (data) {
    confidence = (parseFloat(data.confidence) * 100).toFixed(2);
  }

  return (
    <>
      <AppBarStyled position="static">
        <Toolbar>
          <Typography variant="h6" noWrap>
            Potato Disease Classification
          </Typography>
        </Toolbar>
      </AppBarStyled>
      <MainContainer maxWidth={false} disableGutters>
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
          padding={2}
        >
          <Grid item xs={12}>
            <CustomCard className={!image ? 'empty' : ''}>
              {!image && (
                <CardContent>
                  <div
                    {...getRootProps({ className: 'dropzone' })}
                    style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center' }}
                  >
                    <input {...getInputProps()} />
                    <Typography variant="body1">
                      Drag and drop an image of a potato plant leaf to process
                    </Typography>
                  </div>
                </CardContent>
              )}
              {image && (
                <CardActionArea>
                  <CardMedia
                    image={preview}
                    component="img"
                    title="Uploaded Image"
                  />
                </CardActionArea>
              )}
              {data && (
                <CardContent>
                  <TableContainerStyled>
                    <TableStyled size="small" aria-label="simple table">
                      <TableHeadStyled>
                        <TableRowStyled>
                          <TableCellStyled1>Label:</TableCellStyled1>
                          <TableCellStyled1 align="right">Confidence:</TableCellStyled1>
                        </TableRowStyled>
                      </TableHeadStyled>
                      <TableBody>
                        <TableRowStyled>
                          <TableCellStyled component="th" scope="row">
                            {data.class}
                          </TableCellStyled>
                          <TableCellStyled align="right">{confidence}%</TableCellStyled>
                        </TableRowStyled>
                      </TableBody>
                    </TableStyled>
                  </TableContainerStyled>
                </CardContent>
              )}
              {isLoading && (
                <CardContent>
                  <Loader />
                  <Typography variant="h6" noWrap>
                    Processing
                  </Typography>
                </CardContent>
              )}
            </CustomCard>
          </Grid>
          {data && (
            <Grid item>
              <ColorButton
                variant="contained"
                color="primary"
                size="large"
                onClick={clearData}
                startIcon={<Clear fontSize="large" />}
              >
                Clear
              </ColorButton>
            </Grid>
          )}
        </Grid>
      </MainContainer>
    </>
  );
};

export default ImageUpload;
