import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import Modal from '../components/shared/Modal';
import { toast } from 'react-toastify';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  FaUserCircle,
  FaEdit,
  FaCheck,
  FaTimes,
  FaCamera,
  FaInbox,
  FaPaperPlane
} from 'react-icons/fa';

import ConnectionRequestCard from '../components/ConnectionRequestCard';
const Label = styled.label`
  font-weight: 600;
  display: block;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(4)};
  max-width: 900px;
  width: 100%;
  margin: ${({ theme }) => theme.spacing(4)} auto;
  .glassmorphism;
  animation: fadeIn 0.8s ease-out;
  position: relative;
  overflow: hidden;
`;

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  padding-bottom: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const ProfilePictureContainer = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  border: 3px solid ${({ theme }) => theme.colors.accent};
  box-shadow: 0 0 15px rgba(255, 205, 210, 0.5); /* Soft glow */
  cursor: pointer;
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }
`;

const ProfilePicture = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const EditPictureOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  ${ProfilePictureContainer}:hover & {
    opacity: 1;
  }
  svg {
    color: white;
    font-size: 2.5rem;
  }
`;

const ProfileName = styled.h2`
  font-size: 2.5rem;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ProfileRole = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.accent};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  text-transform: capitalize;
`;

const Section = styled.div`
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  background: rgba(255, 255, 255, 0.05); /* Slightly darker glass */
  padding: ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease-in-out;
  animation: slideInRight 0.5s ease-out;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }

  h3 {
    color: ${({ theme }) => theme.colors.secondary};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    font-size: 1.8rem;
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(1)};
  }

  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.6;
    font-size: 1.1rem;
    margin-bottom: ${({ theme }) => theme.spacing(1)};
  }
`;

const EditButton = styled(Button)`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.accent};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  font-size: 0.9rem;
  margin-left: ${({ theme }) => theme.spacing(2)};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const SaveCancelButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const TextArea = styled.textarea`
  width: calc(100% - ${({ theme }) => theme.spacing(4)});
  padding: ${({ theme }) => theme.spacing(1.5)} ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 1rem;
  transition: all 0.3s ease-in-out;
  box-sizing: border-box;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px rgba(255, 205, 210, 0.5);
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const Tag = styled.span`
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: ${({ theme }) => theme.spacing(0.5)} ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
  .remove-tag {
    cursor: pointer;
    font-size: 0.8rem;
    &:hover {
      color: ${({ theme }) => theme.colors.error};
    }
  }
`;

const AddTagInput = styled(Input)`
  width: auto;
  flex-grow: 1;
  margin-bottom: 0;
  max-width: 250px;
`;

const TagInputWrapper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  align-items: center;
  flex-wrap: wrap;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const TabButton = styled(Button)`
  background-color: ${({ theme, active }) => active ? theme.colors.primary : 'transparent'};
  color: ${({ theme, active }) => active ? theme.colors.textPrimary : theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.accent};

  &:hover {
    background-color: ${({ theme, active }) => active ? theme.colors.primary : 'rgba(255, 205, 210, 0.1)'};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const RequestsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;


const ProfilePage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [isEditingEducation, setIsEditingEducation] = useState(false);
    const [isEditingInterests, setIsEditingInterests] = useState(false);
    const [tempBio, setTempBio] = useState('');
    const [tempSchoolName, setTempSchoolName] = useState('');
    const [tempCollegeName, setTempCollegeName] = useState('');
    const [tempDepartment, setTempDepartment] = useState('');
    const [tempInterestedDomains, setTempInterestedDomains] = useState([]);
    const [newInterest, setNewInterest] = useState('');

    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [imageToCrop, setImageToCrop] = useState(null);
    const [crop, setCrop] = useState({ aspect: 1 / 1, unit: '%', width: 90 });
    const [completedCrop, setCompletedCrop] = useState(null);
    const imgRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'sent', 'received'
    const [sentRequests, setSentRequests] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);


    const fetchProfile = useCallback(async () => {
        if (user) {
            try {
                const res = await api.get(`/users/me`);
                setProfile(res.data);
                setTempBio(res.data.bio);
                setTempSchoolName(res.data.schoolName);
                setTempCollegeName(res.data.collegeName);
                setTempDepartment(res.data.department);
                setTempInterestedDomains(res.data.interestedDomains || []);
            } catch (error) {
                console.error('Error fetching profile:', error.response?.data?.message || error.message);
                toast.error('Failed to load user profile. It might not exist or be inaccessible.');
            }
        }
    }, [user]);

    const fetchSentRequests = useCallback(async () => {
        if (user && user.role === 'junior') {
            try {
                const res = await api.get('/connections/requests/sent');
                setSentRequests(res.data);
            } catch (error) {
                console.error('Error fetching sent requests:', error.response?.data?.message || error.message);
            }
        }
    }, [user]);

    const fetchReceivedRequests = useCallback(async () => {
        if (user && user.role === 'senior') {
            try {
                const res = await api.get('/connections/requests/received');
                setReceivedRequests(res.data);
            } catch (error) {
                console.error('Error fetching received requests:', error.response?.data?.message || error.message);
            }
        }
    }, [user]);


    useEffect(() => {
        fetchProfile();
        fetchSentRequests();
        fetchReceivedRequests();
    }, [fetchProfile, fetchSentRequests, fetchReceivedRequests]);


    const handleBioSave = async () => {
        try {
            await api.put('/users/me', { bio: tempBio });
            setProfile(prev => ({ ...prev, bio: tempBio }));
            setIsEditingBio(false);
            toast.success('Bio updated successfully!');
        } catch (error) {
            console.error('Error updating bio:', error);
            toast.error('Failed to update bio.');
        }
    };

    const handleEducationSave = async () => {
        try {
            await api.put('/users/me', {
                schoolName: tempSchoolName,
                collegeName: tempCollegeName,
                department: tempDepartment
            });
            setProfile(prev => ({
                ...prev,
                schoolName: tempSchoolName,
                collegeName: tempCollegeName,
                department: tempDepartment
            }));
            setIsEditingEducation(false);
            toast.success('Education details updated successfully!');
        } catch (error) {
            console.error('Error updating education:', error);
            toast.error('Failed to update education details.');
        }
    };

    const handleInterestsSave = async () => {
        try {
            await api.put('/users/me', { interestedDomains: tempInterestedDomains });
            setProfile(prev => ({ ...prev, interestedDomains: tempInterestedDomains }));
            setIsEditingInterests(false);
            toast.success('Interested domains updated successfully!');
        } catch (error) {
            console.error('Error updating interested domains:', error);
            toast.error('Failed to update interested domains.');
        }
    };

    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => setImageToCrop(reader.result));
            reader.readAsDataURL(e.target.files[0]);
            setShowPhotoModal(true);
        }
    };

    const onLoad = useCallback((img) => {
        imgRef.current = img;
    }, []);

    const getCroppedImg = async (image, crop) => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg');
        });
    };

    const handleCropSave = async () => {
        if (imgRef.current && completedCrop) {
            setUploading(true);
            const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
            const formData = new FormData();
            formData.append('profilePicture', croppedImageBlob, 'profile.jpg');

            try {
                const res = await api.put('/users/me/picture', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setProfile(prev => ({ ...prev, profilePictureUrl: res.data.profilePictureUrl }));
                toast.success('Profile picture updated!');
                setShowPhotoModal(false);
                setImageToCrop(null);
                setCompletedCrop(null);
            } catch (error) {
                console.error('Error uploading profile picture:', error);
                toast.error('Failed to update profile picture.');
            } finally {
                setUploading(false);
            }
        }
    };

    const handleAddInterest = () => {
        if (newInterest.trim() && !tempInterestedDomains.includes(newInterest.trim())) {
            setTempInterestedDomains([...tempInterestedDomains, newInterest.trim()]);
            setNewInterest('');
        }
    };

    const handleRemoveInterest = (interestToRemove) => {
        setTempInterestedDomains(tempInterestedDomains.filter(interest => interest !== interestToRemove));
    };


    const handleRequestAction = async (requestId, actionType) => {
        try {
            await api.put(`/connections/${actionType}/${requestId}`);
            toast.success(`Request ${actionType} successfully!`);
            // Refresh requests lists
            fetchReceivedRequests();
            fetchSentRequests();
            fetchProfile(); // To update connections list on profile
        } catch (error) {
            console.error(`Error ${actionType} request:`, error);
            toast.error(`Failed to ${actionType} request.`);
        }
    };


    if (!profile) {
        return <p>Loading profile...</p>;
    }

    return (
        <ProfileContainer>
            <ProfileHeader>
                <input
                    type="file"
                    id="profilePicUpload"
                    accept="image/*"
                    onChange={onSelectFile}
                    style={{ display: 'none' }}
                />
                <ProfilePictureContainer onClick={() => document.getElementById('profilePicUpload').click()}>
                    <ProfilePicture src={profile.profilePictureUrl || 'https://via.placeholder.com/150?text=No+Pic'} alt="Profile" />
                    <EditPictureOverlay><FaCamera /></EditPictureOverlay>
                </ProfilePictureContainer>
                <ProfileName>{profile.userId.name}</ProfileName>
                <ProfileRole>{profile.userId.role}</ProfileRole>
            </ProfileHeader>

            <TabContainer>
                <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
                    <FaUserCircle /> My Profile
                </TabButton>
                {user.role === 'junior' && (
                    <TabButton active={activeTab === 'sent'} onClick={() => setActiveTab('sent')}>
                        <FaPaperPlane /> Sent Requests ({sentRequests.length})
                    </TabButton>
                )}
                {user.role === 'senior' && (
                    <TabButton active={activeTab === 'received'} onClick={() => setActiveTab('received')}>
                        <FaInbox /> Received Requests ({receivedRequests.length})
                    </TabButton>
                )}
            </TabContainer>

            {activeTab === 'profile' && (
                <>
                    <Section>
                        <h3>About Me {!isEditingBio && <EditButton onClick={() => setIsEditingBio(true)}><FaEdit /> Edit</EditButton>}</h3>
                        {isEditingBio ? (
                            <>
                                <TextArea
                                    value={tempBio}
                                    onChange={(e) => setTempBio(e.target.value)}
                                    placeholder="Tell us about yourself..."
                                />
                                <SaveCancelButtons>
                                    <Button onClick={handleBioSave}><FaCheck /> Save</Button>
                                    <Button variant="secondary" onClick={() => { setIsEditingBio(false); setTempBio(profile.bio); }}><FaTimes /> Cancel</Button>
                                </SaveCancelButtons>
                            </>
                        ) : (
                            <p>{profile.bio || 'No bio yet. Click edit to add one!'}</p>
                        )}
                    </Section>

                    <Section>
                        <h3>Education {!isEditingEducation && <EditButton onClick={() => setIsEditingEducation(true)}><FaEdit /> Edit</EditButton>}</h3>
                        {isEditingEducation ? (
                            <>
                                <Label>School Name:</Label>
                                <Input
                                    type="text"
                                    value={tempSchoolName}
                                    onChange={(e) => setTempSchoolName(e.target.value)}
                                    placeholder="Your high school name"
                                />
                                {user.role === 'senior' && (
                                    <>
                                        <Label>College Name:</Label>
                                        <Input
                                            type="text"
                                            value={tempCollegeName}
                                            onChange={(e) => setTempCollegeName(e.target.value)}
                                            placeholder="Your college name"
                                        />
                                        <Label>Department:</Label>
                                        <Input
                                            type="text"
                                            value={tempDepartment}
                                            onChange={(e) => setTempDepartment(e.target.value)}
                                            placeholder="Your department"
                                        />
                                    </>
                                )}
                                <SaveCancelButtons>
                                    <Button onClick={handleEducationSave}><FaCheck /> Save</Button>
                                    <Button variant="secondary" onClick={() => {
                                        setIsEditingEducation(false);
                                        setTempSchoolName(profile.schoolName);
                                        setTempCollegeName(profile.collegeName);
                                        setTempDepartment(profile.department);
                                    }}><FaTimes /> Cancel</Button>
                                </SaveCancelButtons>
                            </>
                        ) : (
                            <>
                                <p><strong>School:</strong> {profile.schoolName || 'N/A'}</p>
                                {user.role === 'senior' && (
                                    <>
                                        <p><strong>College:</strong> {profile.collegeName || 'N/A'}</p>
                                        <p><strong>Department:</strong> {profile.department || 'N/A'}</p>
                                    </>
                                )}
                            </>
                        )}
                    </Section>

                    {user.role === 'junior' && (
                        <Section>
                            <h3>Interested Domains {!isEditingInterests && <EditButton onClick={() => setIsEditingInterests(true)}><FaEdit /> Edit</EditButton>}</h3>
                            {isEditingInterests ? (
                                <>
                                    <TagInputWrapper>
                                        <AddTagInput
                                            type="text"
                                            value={newInterest}
                                            onChange={(e) => setNewInterest(e.target.value)}
                                            onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddInterest(); } }}
                                            placeholder="Add an interest (e.g., AI, Engineering)"
                                        />
                                        <Button onClick={handleAddInterest}>Add</Button>
                                    </TagInputWrapper>
                                    <TagsContainer>
                                        {tempInterestedDomains.map((interest, index) => (
                                            <Tag key={index}>
                                                {interest} <span className="remove-tag" onClick={() => handleRemoveInterest(interest)}>&times;</span>
                                            </Tag>
                                        ))}
                                    </TagsContainer>
                                    <SaveCancelButtons>
                                        <Button onClick={handleInterestsSave}><FaCheck /> Save</Button>
                                        <Button variant="secondary" onClick={() => {
                                            setIsEditingInterests(false);
                                            setTempInterestedDomains(profile.interestedDomains || []);
                                        }}><FaTimes /> Cancel</Button>
                                    </SaveCancelButtons>
                                </>
                            ) : (
                                <TagsContainer>
                                    {profile.interestedDomains && profile.interestedDomains.length > 0 ? (
                                        profile.interestedDomains.map((interest, index) => <Tag key={index}>{interest}</Tag>)
                                    ) : (
                                        <p>No interested domains added yet.</p>
                                    )}
                                </TagsContainer>
                            )}
                        </Section>
                    )}
                </>
            )}

            {activeTab === 'sent' && user.role === 'junior' && (
                <Section style={{ animation: 'slideInLeft 0.5s ease-out' }}>
                    <h3>Sent Connection Requests</h3>
                    <RequestsList>
                        {sentRequests.length > 0 ? (
                            sentRequests.map((request) => (
                                <ConnectionRequestCard
                                    key={request._id}
                                    request={request}
                                    isSender={true}
                                />
                            ))
                        ) : (
                            <p>No sent connection requests.</p>
                        )}
                    </RequestsList>
                </Section>
            )}

            {activeTab === 'received' && user.role === 'senior' && (
                <Section style={{ animation: 'slideInRight 0.5s ease-out' }}>
                    <h3>Received Connection Requests</h3>
                    <RequestsList>
                        {receivedRequests.length > 0 ? (
                            receivedRequests.map((request) => (
                                <ConnectionRequestCard
                                    key={request._id}
                                    request={request}
                                    onAccept={() => handleRequestAction(request._id, 'accept')}
                                    onReject={() => handleRequestAction(request._id, 'reject')}
                                />
                            ))
                        ) : (
                            <p>No received connection requests.</p>
                        )}
                    </RequestsList>
                </Section>
            )}

            <Modal isOpen={showPhotoModal} onClose={() => setShowPhotoModal(false)}>
                <h2>Crop your profile picture</h2>
                {imageToCrop && (
                    <>
                        <div style={{ position: 'relative', width: '100%', height: '300px', marginBottom: '20px' }}>
                            <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={1}>
                                <img src={imageToCrop} ref={imgRef} onLoad={onLoad} alt="Crop" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                            </ReactCrop>
                        </div>
                        <Button onClick={handleCropSave} disabled={!completedCrop || uploading}>
                            {uploading ? 'Uploading...' : 'Save Cropped Image'}
                        </Button>
                    </>
                )}
            </Modal>
        </ProfileContainer>
    );
};

export default ProfilePage;