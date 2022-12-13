import React, { useState } from "react";

import Typography from "@mui/material/Typography";

import IconButton from "@mui/material/IconButton";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import {
  TouchcommADCReport,
  TouchcommTouchReport,
  TouchcommTraceReport
} from "@webds/service";

import ADCPlayback from "./adc_plots/ADCPlayback";
import TouchPlayback from "./touch_plots/TouchPlayback";
import PlaybackProgress from "./playback_controls/PlaybackProgress";
import PlaybackSlider from "./playback_controls/PlaybackSlider";
import PlaybackSpeed from "./playback_controls/PlaybackSpeed";

import {
  ALERT_MESSAGE_LOAD_FILE,
  FLIP_OFFSET,
  MIN_WIDTH,
  PLOT_LENGTH
} from "./constants";

import { Canvas } from "./mui_extensions/Canvas";
import { Content } from "./mui_extensions/Content";
import { Controls } from "./mui_extensions/Controls";

import {
  HFlipToggle,
  VFlipToggle,
  TraceViewToggle
} from "./mui_extensions/Button";

type ADCData = TouchcommADCReport[];

type TouchData = TouchcommTouchReport[];

type TraceData = TouchcommTraceReport[];

export const ADCDataContext = React.createContext([] as ADCData);

export const TouchDataContext = React.createContext([] as TouchData);

export const TraceDataContext = React.createContext([] as TraceData);

type Flip = {
  h: boolean;
  v: boolean;
};

const selectFile = async (
  event: React.ChangeEvent<HTMLInputElement>
): Promise<any> => {
  if (event.target.files === null) {
    return Promise.reject("No file selected");
  }
  let data: any = await event.target.files[0].text();
  if (data.length > 0) {
    try {
      data = JSON.parse(data);
      if (!data.info || !data.frames || data.frames.length === 0) {
        return Promise.reject("No valid JSON data content");
      }
    } catch (error) {
      return Promise.reject("Invalid file content");
    }
  } else {
    return Promise.reject("No file content");
  }
  return data;
};

const generateTraceData = (touchData: any): TraceData => {
  const traceData: TraceData = [];
  let xTrace: number[][] = [...Array(10)].map((e) => Array(1));
  let yTrace: number[][] = [...Array(10)].map((e) => Array(1));
  let traceStatus: string[] = [...Array(10)].map((e) => "*");

  touchData.forEach((item: any) => {
    let pos = item.pos;
    if (pos === undefined) {
      pos = [];
    }
    for (let i = 0; i < 10; i++) {
      if (traceStatus[i] === "+") {
        traceStatus[i] = "-";
      }
    }
    for (let i = 0; i < pos.length; i++) {
      const obj = pos[i];
      const index = obj.objectIndex;
      if (traceStatus[index] === "*") {
        xTrace[index] = [obj.xMeas];
        yTrace[index] = [obj.yMeas];
      } else {
        xTrace[index].push(obj.xMeas);
        yTrace[index].push(obj.yMeas);
      }
      traceStatus[index] = "+";
    }
    for (let i = 0; i < 10; i++) {
      if (traceStatus[i] === "-") {
        traceStatus[i] = "*";
      }
    }
    traceData.push({
      xTrace: xTrace.map((inner: number[]) => inner.slice()),
      yTrace: yTrace.map((inner: number[]) => inner.slice())
    });
  });
  return traceData;
};

export const Landing = (props: any): JSX.Element => {
  const [run, setRun] = useState<boolean>(false);
  const [appInfo, setAppInfo] = useState<any>();
  const [adcData, setADCData] = useState<ADCData>([]);
  const [touchData, setTouchData] = useState<TouchData>([]);
  const [traceData, setTraceData] = useState<TraceData>([]);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0);
  const [dataCounter, setDataCounter] = useState<number>(0);
  const [frameIndex, setFrameIndex] = useState<number>(0);
  const [plotWidth, setPlotWidth] = useState<number>(0);
  const [traceView, setTraceView] = useState<boolean>(false);
  const [adcFlip, setADCFlip] = useState<Flip>({ h: false, v: false });
  const [touchFlip, setTouchFlip] = useState<Flip>({ h: false, v: false });

  const handleUploadButtonClick = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const data = await selectFile(event);
      const appInfo = data.info;
      const adcData = data.frames.map((item: any) => item.frame[1]);
      const touchData = data.frames.map((item: any) => item.report[1]);
      const traceData = generateTraceData(touchData);
      setRun(false);
      setAppInfo(appInfo);
      setADCData(adcData);
      setTouchData(touchData);
      setTraceData(traceData);
      setDataCounter((prev) => prev + 1);
      setTimeout(() => {
        setFrameIndex(0);
      }, 1);
    } catch (error) {
      console.error(error);
      props.showAlert(ALERT_MESSAGE_LOAD_FILE);
      return;
    }
  };

  return (
    <Canvas title="Test Data Viewer" minWidth={MIN_WIDTH}>
      <Content>
        {adcData.length > 0 && touchData.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row"
            }}
          >
            <div
              style={{
                width: "50%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row"
                }}
              >
                <div style={{ width: FLIP_OFFSET + "px" }} />
                <div style={{ position: "relative" }}>
                  {adcData.length > 0 ? (
                    <>
                      <ADCDataContext.Provider value={adcData}>
                        <ADCPlayback
                          length={PLOT_LENGTH}
                          setWidth={setPlotWidth}
                          imageOnly={true}
                          portrait={true}
                          flip={adcFlip}
                          run={run}
                          setRun={setRun}
                          speed={playbackSpeed}
                          frameIndex={frameIndex}
                          setFrameIndex={setFrameIndex}
                          numFrames={adcData.length}
                          dataCounter={dataCounter}
                        />
                      </ADCDataContext.Provider>
                      <VFlipToggle
                        value="vFlip"
                        selected={adcFlip.v}
                        onChange={() => {
                          setADCFlip((prev) => {
                            const updated = { ...prev };
                            updated.v = !updated.v;
                            return updated;
                          });
                        }}
                        sx={{
                          position: "absolute",
                          left: -FLIP_OFFSET,
                          top: PLOT_LENGTH - 40 - FLIP_OFFSET
                        }}
                      />
                      <HFlipToggle
                        value="hFlip"
                        selected={adcFlip.h}
                        onChange={() => {
                          setADCFlip((prev) => {
                            const updated = { ...prev };
                            updated.h = !updated.h;
                            return updated;
                          });
                        }}
                        sx={{
                          position: "absolute",
                          left: -FLIP_OFFSET,
                          top: PLOT_LENGTH - 40
                        }}
                      />
                    </>
                  ) : null}
                </div>
              </div>
            </div>
            <div
              style={{
                width: "50%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row"
                }}
              >
                <div style={{ position: "relative" }}>
                  {touchData.length > 0 ? (
                    <>
                      <TouchDataContext.Provider value={touchData}>
                        <TraceDataContext.Provider value={traceData}>
                          <TouchPlayback
                            length={PLOT_LENGTH}
                            width={plotWidth}
                            passive={true}
                            portrait={true}
                            flip={touchFlip}
                            traceView={traceView}
                            appInfo={appInfo}
                            run={run}
                            setRun={setRun}
                            speed={playbackSpeed}
                            frameIndex={frameIndex}
                            setFrameIndex={setFrameIndex}
                            numFrames={touchData.length}
                            dataCounter={dataCounter}
                          />
                        </TraceDataContext.Provider>
                      </TouchDataContext.Provider>
                      <TraceViewToggle
                        value="traceView"
                        selected={traceView}
                        onChange={() => {
                          setTraceView(!traceView);
                        }}
                        sx={{
                          position: "absolute",
                          right: -FLIP_OFFSET,
                          top: PLOT_LENGTH - 40 - FLIP_OFFSET * 2
                        }}
                      />
                      <VFlipToggle
                        value="vFlip"
                        selected={touchFlip.v}
                        onChange={() => {
                          setTouchFlip((prev) => {
                            const updated = { ...prev };
                            updated.v = !updated.v;
                            return updated;
                          });
                        }}
                        sx={{
                          position: "absolute",
                          right: -FLIP_OFFSET,
                          top: PLOT_LENGTH - 40 - FLIP_OFFSET
                        }}
                      />
                      <HFlipToggle
                        value="hFlip"
                        selected={touchFlip.h}
                        onChange={() => {
                          setTouchFlip((prev) => {
                            const updated = { ...prev };
                            updated.h = !updated.h;
                            return updated;
                          });
                        }}
                        sx={{
                          position: "absolute",
                          right: -FLIP_OFFSET,
                          top: PLOT_LENGTH - 40
                        }}
                      />
                    </>
                  ) : null}
                </div>
                <div style={{ width: FLIP_OFFSET + "px" }} />
              </div>
            </div>
          </div>
        ) : (
          <Typography
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)"
            }}
          >
            Please upload test data
          </Typography>
        )}
      </Content>
      <Controls
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <IconButton
            color="primary"
            component="label"
            sx={{
              width: "40px",
              height: "40px",
              padding: "0px",
              "& .MuiSvgIcon-root": {
                fontSize: "2.5rem"
              }
            }}
          >
            <input
              hidden
              type="file"
              accept=".json"
              onChange={handleUploadButtonClick}
            />
            <CloudUploadIcon />
          </IconButton>
          <div
            style={{
              width: "100%",
              margin: "0px 16px 0px 24px",
              display: "flex",
              alignItems: "center"
            }}
          >
            {run ? (
              <div style={{ width: "100%" }}>
                <PlaybackProgress
                  frameIndex={frameIndex}
                  numFrames={adcData.length}
                />
              </div>
            ) : (
              <PlaybackSlider
                frameIndex={frameIndex}
                setFrameIndex={setFrameIndex}
                numFrames={adcData.length}
                sx={{ display: "flex", alignItems: "center" }}
              />
            )}
          </div>
          <IconButton
            color="primary"
            disabled={adcData.length === 0}
            onClick={() => {
              setRun(!run);
            }}
            sx={{
              padding: "0px",
              "& .MuiSvgIcon-root": {
                fontSize: "2.5rem"
              }
            }}
          >
            {run ? <PauseCircleIcon /> : <PlayCircleIcon />}
          </IconButton>
          <IconButton
            color="primary"
            disabled={adcData.length === 0}
            onClick={() => {
              setRun(false);
              setTimeout(() => {
                setFrameIndex(0);
              }, 1);
            }}
            sx={{
              width: "40px",
              height: "40px",
              padding: "0px",
              "& .MuiSvgIcon-root": {
                fontSize: "2.5rem"
              }
            }}
          >
            <StopCircleIcon />
          </IconButton>
          <div style={{ marginLeft: "8px" }}>
            <PlaybackSpeed
              disabled={adcData.length === 0}
              setPlaybackSpeed={setPlaybackSpeed}
            />
          </div>
        </div>
      </Controls>
    </Canvas>
  );
};

export default Landing;
